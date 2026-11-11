import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Building2,
} from 'lucide-react'

import { useToast } from '../../context/ToastContext'
import { mockStore } from '../../services/mockStore'

import { Input } from '../../components/ui/Input/Input'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Select } from '../../components/ui/Select/Select'

import logBack from '../../assets/log-back.jpg'
import govLogo from '../../assets/Emblem_of_Sri_Lanka.png'
import pensionLogo from '../../assets/logo_pensionDPT_white.png'
import { authService } from '../../services/AuthService'

export const SignupPage: React.FC = () => {
  const { success, error } = useToast()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pensionPointId, setPensionPointId] = useState<string>('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const dsOffices = mockStore.getDSOffices()

  const dsOfficeOptions = dsOffices.map((office) => ({
    value: String(office.id),
    label: office.name,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!username.trim()) {
      error('Please enter a username.')
      return
    }

    if (!fullName.trim()) {
      error('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      error('Please enter your email address.')
      return
    }

    if (!phone.trim()) {
      error('Please enter your phone number.')
      return
    }

    if (!pensionPointId) {
      error('Please select a DS Office.')
      return
    }

    if (!password.trim()) {
      error('Please enter a password.')
      return
    }

    if (password.length < 6) {
      error('Password must contain at least 6 characters.')
      return
    }

    setIsLoading(true)

    try {
      await authService.register({
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        department: 'PENSION',
        pensionPointId: Number(pensionPointId),
        phone: phone.trim(),
        roles: ['PENSION_POINT_OFFICER'],
      })

      success('Account created successfully. Please sign in.')

      // Clear form after successful registration
      setUsername('')
      setFullName('')
      setEmail('')
      setPhone('')
      setPensionPointId('')
      setPassword('')

      // Go to login page
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'

      error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-slate-50 overflow-hidden">

      {/* Background */}
      <img
        src={logBack}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
      />

      {/* Main Card */}
      <div className="fixed w-full max-w-4xl min-h-[480px] lg:h-[520px] bg-white rounded-[28px] overflow-hidden shadow-2xl flex items-center justify-center flex-col lg:flex-row">

        {/* LEFT GREEN BRAND PANEL */}
        <div
          className="relative w-full lg:w-[48%] min-h-[300px] lg:h-full overflow-hidden bg-gradient-to-br
            from-[#1E40AF] via-[#1E3A8A] to-[#0F172A] text-white flex flex-col items-center justify-center p-8
            rounded-tl-[0px] rounded-tr-[40%] rounded-br-[0px] rounded-bl-[35%]"
        >

          {/* Decorative green overlay */}
          <div className="absolute justify-center items-center w-[500px] h-[500px] rounded-full bg-[#1E40AF] opacity-10" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">

            {/* Welcome */}
            <div className="mt-5">
              <h2 className="text-xl sm:text-3xl font-semibold">
                Welcome to ISPD!
              </h2>
            </div>

            {/* Center Graphic & Mission Statement */}
            <div className="relative z-10 max-w-lg my-auto flex items-center justify-center">

              {/* Flip container */}
              <div className="[perspective:1000px]">

                {/* Rotating card */}
                <div
                  className="relative w-48 h-48 cursor-pointer transition-transform duration-700 ease-in-out [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]"
                >

                  {/* Government Logo - Front */}
                  <div className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
                    <img
                      src={govLogo}
                      alt="Government Logo"
                      className="w-45 h-45 object-contain p-5"
                    />
                  </div>

                  {/* Pension Logo - Back */}
                  <div className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <img
                      src={pensionLogo}
                      alt="Pension Logo"
                      className="w-45 h-45 object-contain p-5"
                    />
                  </div>

                </div>
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-bold tracking-wide">
              INVENTORY MANAGEMENT SYSTEM
            </h1>

            <p className="mt-3 text-sm text-white/80">
              Department of Pensions
            </p>

            {/* Green panel button */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-7 w-40 h-10 rounded-full border border-white/60 text-sm
                font-medium text-white hover:bg-white hover:text-[#1E40AF] transition-all duration-300"
            >
              SIGN IN
            </button>

          </div>
        </div>

        {/* RIGHT REGISTER PANEL */}
        <div className="w-full lg:w-[52%] bg-white overflow-hidden flex items-center justify-center p-6 sm:p-10 lg:p-12">

          {/* TOP-RIGHT GREEN CURVE */}
          <div className="absolute -top-[150px] -right-[170px] w-[320px] h-[320px] rounded-full bg-gradient-to-br
            from-[#1E40AF] via-[#1E3A8A] to-[#0F172A] z-0"
          />

          <div className="absolute -top-[20px] -right-[5px] w-[320px] h-[320px] bg-white rounded-full" />

          <div className="w-full max-w-sm z-10">

            {/* REGISTER HEADER */}
            <div className="text-center mb-7">
              <h2 className="text-4xl font-bold text-[#1E40AF]">
                Welcome
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create a new account
              </p>
            </div>

            {/* REGISTER FORM */}
            <form
              id="register-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Username */}
              <div>
                <Input
                  label=""
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  leftIcon={
                    <User className="w-4 h-4 text-[#1E40AF]" />
                  }
                  autoComplete="username"
                  required
                />
              </div>

              {/* Fullname */}
              <div>
                <Input
                  label=""
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={
                    <User className="w-4 h-4 text-[#1E40AF]" />
                  }
                  autoComplete="name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  label=""
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={
                    <Mail className="w-4 h-4 text-[#1E40AF]" />
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div className='flex gap-5'>
                {/* Phone */}
                <div>
                    <Input
                        label=""
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        leftIcon={
                            <Phone className="w-4 h-4 text-[#1E40AF]" />
                        }
                        autoComplete="tel"
                        required
                    />
                </div>

                {/* DS Office / Pension Point */}
                <div>
                    <Select
                        value={pensionPointId}
                        onChange={(e) => setPensionPointId(e.target.value)}
                        options={dsOfficeOptions}
                        placeholder="DS Office"
                        required
                        leftIcon={
                            <Building2 className="w-4 h-4 text-[#1E40AF]" />
                        }
                    />
                </div>
              </div>

              {/* Password */}
              <div>
                <Input
                  label=""
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={
                    <Lock className="w-4 h-4 text-[#1E40AF]" />
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="
                        p-1
                        text-slate-400
                        hover:text-[#1E40AF]
                        transition-colors
                      "
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Register Button */}
              <div className="flex justify-center pt-2">
                <PrimaryButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                >
                  Sign Up
                </PrimaryButton>
              </div>

            </form>

            {/* FOOTER */}
            <div className="mt-7 text-center">

              <p className="text-[10px] text-slate-400">
                Department of Pensions Sri Lanka
              </p>

              <p className="text-[9px] text-slate-300 mt-1">
                Official Government Network Portal • v1.0
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}