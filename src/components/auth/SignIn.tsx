import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import logo from '../../assets/images/flowva_logo.png'
import type { SignInForm } from '../../types'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
}).required()

const SignIn: React.FC = () => {
  const { signIn, loading, error } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>({ resolver: yupResolver(schema) })
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data: SignInForm) => {
    setSubmitError(null)
    await signIn(data.email, data.password)
    if (error) setSubmitError(error)
    else navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#f9fafb]">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center mb-4">
          <img src={logo} alt="FlowvaHub Logo" className="h-12" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2 text-center">Welcome back</h1>
        <p className="text-sm text-slate-600 mb-6 text-center">Sign in to access your dashboard</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full rounded-lg border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} {...register('password')} className="w-full rounded-lg text-sm border border-violet-200 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-300" />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer">
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {submitError && <div className="text-sm text-red-600">{submitError}</div>}

          <button type="submit" disabled={loading} className="w-full text-sm inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-60 cursor-pointer">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-700">
          Don’t have an account?{' '}
          <Link to="/auth/signup" className="text-violet-700 hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default SignIn