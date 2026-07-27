import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Em produção, isso seria gerenciado por KMS ou variáveis de ambiente.
// Para demonstração, vamos gerar uma chave e salvar em um arquivo se não existir.
const KEY_DIR = path.join(process.cwd(), 'keys')
const PRIVATE_KEY_PATH = path.join(KEY_DIR, 'private_key.pem')
const PUBLIC_KEY_PATH = path.join(KEY_DIR, 'public_key.pem')

export function ensureKeysExist() {
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true })
  }

  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey)
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey)
  }
}

export function signData(data: string): string {
  ensureKeysExist()
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')
  
  const sign = crypto.createSign('SHA256')
  sign.update(data)
  sign.end()
  
  return sign.sign(privateKey, 'base64')
}

export function verifySignature(data: string, signature: string): boolean {
  ensureKeysExist()
  const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8')
  
  const verify = crypto.createVerify('SHA256')
  verify.update(data)
  verify.end()
  
  return verify.verify(publicKey, signature, 'base64')
}

export function getPublicKey(): string {
  ensureKeysExist()
  return fs.readFileSync(PUBLIC_KEY_PATH, 'utf8')
}

export function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}
