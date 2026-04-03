import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { formDefinition } from '../src/config/formDefinition'
import {
  type SubmissionFieldErrors,
  validateSubmission,
} from '../src/shared/formValidation'
import type { UploadedResume } from '../src/types/form'

const LOCAL_API_PATH = '/api/apply'
const SUBMISSIONS_DIR = path.resolve(process.cwd(), '.easy-hire', 'submissions')

interface StoredSubmission {
  id: string
  receivedAt: string
  name: string
  email: string
  phoneCountry: string
  phone: string
  phoneDigits: string
  areas: string[]
  crafts: string[]
  linkedin: string
  portfolio: string
  message: string
  resume?: {
    originalName: string
    storedName: string
    mimeType: string
    size: number
    path: string
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

function parseStringArray(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return []
  }

  try {
    const parsedValue = JSON.parse(value)
    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function parseMultipartForm(request: IncomingMessage) {
  const formRequest = new Request(`http://localhost${request.url ?? LOCAL_API_PATH}`, {
    method: request.method,
    headers: request.headers as Record<string, string>,
    body: request as never,
    duplex: 'half',
  })

  return formRequest.formData()
}

function getResumeMetadata(resumeEntry: unknown): UploadedResume | null {
  if (!(resumeEntry instanceof File) || resumeEntry.size === 0) {
    return null
  }

  return {
    name: resumeEntry.name,
    size: resumeEntry.size,
    type: resumeEntry.type,
  }
}

function parseSubmission(formData: FormData) {
  const resumeEntry = formData.get('resume')

  return {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    phoneCountry: String(formData.get('phoneCountry') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    phoneDigits: String(formData.get('phoneDigits') ?? ''),
    areas: parseStringArray(formData.get('areas')),
    crafts: parseStringArray(formData.get('crafts')),
    linkedin: String(formData.get('linkedin') ?? '').trim(),
    portfolio: String(formData.get('portfolio') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
    resume: getResumeMetadata(resumeEntry),
    resumeEntry,
  }
}

async function storeSubmission(submission: ReturnType<typeof parseSubmission>) {
  const submissionId = `submission-${Date.now()}`
  const receivedAt = new Date().toISOString()
  const submissionDir = path.join(SUBMISSIONS_DIR, submissionId)

  await mkdir(submissionDir, { recursive: true })

  let storedResume: StoredSubmission['resume']

  if (submission.resumeEntry instanceof File && submission.resumeEntry.size > 0) {
    const storedName = `${Date.now()}-${sanitizeFileName(submission.resumeEntry.name)}`
    const resumePath = path.join(submissionDir, storedName)
    const resumeBuffer = Buffer.from(await submission.resumeEntry.arrayBuffer())

    await writeFile(resumePath, resumeBuffer)

    storedResume = {
      originalName: submission.resumeEntry.name,
      storedName,
      mimeType: submission.resumeEntry.type,
      size: submission.resumeEntry.size,
      path: resumePath,
    }
  }

  const storedSubmission: StoredSubmission = {
    id: submissionId,
    receivedAt,
    name: submission.name,
    email: submission.email,
    phoneCountry: submission.phoneCountry,
    phone: submission.phone,
    phoneDigits: submission.phoneDigits,
    areas: submission.areas,
    crafts: submission.crafts,
    linkedin: submission.linkedin,
    portfolio: submission.portfolio,
    message: submission.message,
    resume: storedResume,
  }

  await writeFile(
    path.join(submissionDir, 'submission.json'),
    JSON.stringify(storedSubmission, null, 2),
    'utf-8',
  )

  return storedSubmission
}

function validateServerSubmission(submission: ReturnType<typeof parseSubmission>) {
  return validateSubmission(
    {
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      phoneDigits: submission.phoneDigits,
      areas: submission.areas,
      crafts: submission.crafts,
      linkedin: submission.linkedin,
      portfolio: submission.portfolio,
      message: submission.message,
      resume: submission.resume,
    },
    formDefinition.fields,
  )
}

async function handleLocalFormApi(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    sendJson(response, 405, {
      ok: false,
      message: 'Method not allowed. Use POST.',
    })
    return
  }

  try {
    const formData = await parseMultipartForm(request)
    const submission = parseSubmission(formData)
    const validationResult = validateServerSubmission(submission)

    if (!validationResult.isValid) {
      sendJson(response, 400, {
        ok: false,
        message: 'Validation failed.',
        errors: validationResult.errors satisfies SubmissionFieldErrors,
      })
      return
    }

    const storedSubmission = await storeSubmission(submission)

    sendJson(response, 200, {
      ok: true,
      submissionId: storedSubmission.id,
      message: 'Candidatura salva localmente com sucesso.',
    })
  } catch (error) {
    console.error('Local form API failed:', error)

    sendJson(response, 500, {
      ok: false,
      message: 'Não foi possível processar a candidatura local.',
    })
  }
}

export function localFormApiPlugin(): Plugin {
  return {
    name: 'easy-hire-local-form-api',
    configureServer(server) {
      server.middlewares.use(LOCAL_API_PATH, (request, response) => {
        void handleLocalFormApi(request, response)
      })
    },
  }
}
