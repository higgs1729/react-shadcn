"use client"

import * as React from "react"
import { CheckCircle2Icon, GalleryVerticalEndIcon, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const WORKSPACE = "Northstar"
const STORAGE_KEY = "studio-example:member-gate"
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

type FieldErrors = {
  email?: string
  password?: string
}

type StoredSession = {
  email: string
}

// No backend session is connected, so "persistence" here means the browser's
// own localStorage: a session survives a reload of this tab, but never
// leaves the browser and is not visible to any server.
function readSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.email === "string" ? { email: parsed.email } : null
  } catch {
    return null
  }
}

function writeSession(session: StoredSession | null) {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage may throw inside a sandboxed iframe or private-browsing mode.
    // The demo still works for the current render; it just won't survive reload.
  }
}

// Local-only validation. dataMode is `local-form-state` and no real auth
// provider is connected, so every rule below runs in the browser and the
// "success" path only confirms the input passed these checks.
//
// Strategy: validate the whole form on submit (not on every keystroke) so a
// member is not scolded mid-typing, and clear a field's error as soon as it is
// edited. Adjust the rules here to change what counts as valid.
function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}

  if (!email.trim()) {
    errors.email = "Enter your work email."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address."
  }

  if (!password) {
    errors.password = "Enter your password."
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }

  return errors
}

function useCountdown(lockedUntil: number | null) {
  const [remainingMs, setRemainingMs] = React.useState(0)

  React.useEffect(() => {
    if (!lockedUntil) {
      setRemainingMs(0)
      return
    }
    const tick = () => setRemainingMs(Math.max(0, lockedUntil - Date.now()))
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [lockedUntil])

  return remainingMs
}

export function MemberGateForm() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [status, setStatus] = React.useState<string | null>(null)
  const [enteredAs, setEnteredAs] = React.useState<string | null>(null)
  const [hydrated, setHydrated] = React.useState(false)
  const [failedAttempts, setFailedAttempts] = React.useState(0)
  const [lockedUntil, setLockedUntil] = React.useState<number | null>(null)

  const remainingMs = useCountdown(lockedUntil)
  const isLocked = remainingMs > 0

  React.useEffect(() => {
    const session = readSession()
    if (session) setEnteredAs(session.email)
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (lockedUntil && remainingMs === 0) {
      setLockedUntil(null)
      setFailedAttempts(0)
    }
  }, [lockedUntil, remainingMs])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isLocked) return

    const nextErrors = validate(email, password)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      const attempts = failedAttempts + 1
      setFailedAttempts(attempts)
      setEnteredAs(null)
      setStatus(null)
      if (attempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS)
      }
      return
    }

    const session: StoredSession = { email: email.trim() }
    writeSession(session)
    setFailedAttempts(0)
    setEnteredAs(session.email)
    setStatus(null)
  }

  function handleExternal(provider: string) {
    // The external-account path has no connected provider, so it reports the
    // boundary locally instead of navigating anywhere.
    setEnteredAs(null)
    setErrors({})
    setStatus(`${provider} sign-in is not connected in this static example.`)
  }

  function signOut() {
    writeSession(null)
    setEnteredAs(null)
    setEmail("")
    setPassword("")
  }

  if (!hydrated) {
    return <div className="flex flex-col gap-6" aria-hidden />
  }

  if (enteredAs) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2Icon className="size-8 text-primary" aria-hidden />
            <div>
              <p className="font-medium">You&apos;re signed in</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {enteredAs} is in the {WORKSPACE} workspace. This session is
                stored in this browser only.
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lockoutSeconds = Math.ceil(remainingMs / 1000)

  return (
    <div className="flex flex-col gap-6">
      <a href="#" className="flex items-center gap-2 self-center font-medium">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEndIcon className="size-4" />
        </div>
        {WORKSPACE}
      </a>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Enter the workspace</CardTitle>
          <CardDescription>
            Sign in with your email and password or a supported account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <LockIcon className="size-8 text-destructive" aria-hidden />
              <div>
                <p className="font-medium">Too many failed attempts</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try again in {lockoutSeconds} second{lockoutSeconds === 1 ? "" : "s"}.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleExternal("Apple")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Apple
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleExternal("Google")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  {status ? (
                    <FieldDescription className="text-center">
                      {status}
                    </FieldDescription>
                  ) : null}
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Field data-invalid={errors.email ? true : undefined}>
                  <FieldLabel htmlFor="member-gate-email">Email</FieldLabel>
                  <Input
                    id="member-gate-email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    aria-invalid={errors.email ? true : undefined}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }))
                      }
                    }}
                  />
                  {errors.email ? <FieldError>{errors.email}</FieldError> : null}
                </Field>
                <Field data-invalid={errors.password ? true : undefined}>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="member-gate-password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="member-gate-password"
                    type="password"
                    value={password}
                    aria-invalid={errors.password ? true : undefined}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                  />
                  {errors.password ? (
                    <FieldError>{errors.password}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <Button type="submit">Enter workspace</Button>
                  {failedAttempts > 0 && (
                    <FieldDescription className="text-center text-destructive">
                      {MAX_ATTEMPTS - failedAttempts} attempt
                      {MAX_ATTEMPTS - failedAttempts === 1 ? "" : "s"} remaining
                      before a temporary lockout.
                    </FieldDescription>
                  )}
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="#">Request access</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
