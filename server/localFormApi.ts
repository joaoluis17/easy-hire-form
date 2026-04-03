import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

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

async function storeSubmission(formData: FormData) {
  const submissionId = `submission-${Date.now()}`
  const receivedAt = new Date().toISOString()
  const submissionDir = path.join(SUBMISSIONS_DIR, submissionId)

  await mkdir(submissionDir, { recursive: true })

  const resumeEntry = formData.get('resume')
  let storedResume: StoredSubmission['resume']

  if (resumeEntry instanceof File && resumeEntry.size > 0) {
    const storedName = `${Date.now()}-${sanitizeFileName(resumeEntry.name)}`
    const resumePath = path.join(submissionDir, storedName)
    const resumeBuffer = Buffer.from(await resumeEntry.arrayBuffer())

    await writeFile(resumePath, resumeBuffer)

    storedResume = {
      originalName: resumeEntry.name,
      storedName,
      mimeType: resumeEntry.type,
      size: resumeEntry.size,
      path: resumePath,
    }
  }

  const submission: StoredSubmission = {
    id: submissionId,
    receivedAt,
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phoneCountry: String(formData.get('phoneCountry') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    phoneDigits: String(formData.get('phoneDigits') ?? ''),
    areas: parseStringArray(formData.get('areas')),
    crafts: parseStringArray(formData.get('crafts')),
    linkedin: String(formData.get('linkedin') ?? ''),
    portfolio: String(formData.get('portfolio') ?? ''),
    message: String(formData.get('message') ?? ''),
    resume: storedResume,
  }

  await writeFile(
    path.join(submissionDir, 'submission.json'),
    JSON.stringify(submission, null, 2),
    'utf-8',
  )

  return submission
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
    const submission = await storeSubmission(formData)

    sendJson(response, 200, {
      ok: true,
      submissionId: submission.id,
      message: 'Application stored locally.',
    })
  } catch (error) {
    console.error('Local form API failed:', error)

    sendJson(response, 500, {
      ok: false,
      message: 'Failed to process local application.',
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
