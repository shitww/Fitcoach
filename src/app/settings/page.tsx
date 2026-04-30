"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  ChevronRight, Bell, Shield, Loader2, Save,
  Mail, Calendar, BellOff, ShieldCheck, Key,
  Eye, EyeOff, AlertTriangle
} from "lucide-react"
import { logger } from '@/lib/logger'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'notifications'
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  
  // 通知设置
  const [notificationSettings, setNotificationSettings] = useState({
    trainingReminders: true,
    workoutCompletion: true,
    achievementUnlocks: true,
    systemUpdates: true,
    emailNotifications: true
  })
  
  // 账号安全设置
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)

  const user = session?.user

  const handleNotificationChange = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const handleSecurityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSecuritySettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      // 这里应该调用API更新通知设置
      logger.info('保存通知设置:', notificationSettings)
      // 模拟保存成功
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } catch (error) {
      logger.warn('保存失败:', error)
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }
    
    setLoading(true)
    try {
      // 这里应该调用API修改密码
      logger.info('修改密码:', securitySettings)
      // 模拟保存成功
      setTimeout(() => {
        setLoading(false)
        setSecuritySettings({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        alert('密码修改成功')
      }, 1000)
    } catch (error) {
      logger.warn('修改失败:', error)
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#CCFF00' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>请先登录</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-8 py-3 font-bold rounded-xl text-black"
            style={{ background: '#CCFF00' }}
          >
            立即登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,255,0,0.04) 0%, transparent 60%)'
      }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/profile')}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-xl font-black">设置</h1>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => router.push('/settings?tab=notifications')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-#111 text-white' : 'bg-#0a0a0a text-white/50'}`}
            style={{
              background: activeTab === 'notifications' ? '#111' : '#0a0a0a',
              border: '1px solid #1e1e1e',
              color: activeTab === 'notifications' ? '#CCFF00' : 'rgba(255,255,255,0.5)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              <span>通知设置</span>
            </div>
          </button>
          <button
            onClick={() => router.push('/settings?tab=security')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-#111 text-white' : 'bg-#0a0a0a text-white/50'}`}
            style={{
              background: activeTab === 'security' ? '#111' : '#0a0a0a',
              border: '1px solid #1e1e1e',
              color: activeTab === 'security' ? '#CCFF00' : 'rgba(255,255,255,0.5)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>账号安全</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          {activeTab === 'notifications' ? (
            <>
              <h2 className="text-lg font-bold mb-6">通知设置</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#111' }}>
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" style={{ color: '#CCFF00' }} />
                    <div>
                      <div className="font-medium text-sm">训练提醒</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>按时提醒您进行训练</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.trainingReminders}
                      onChange={() => handleNotificationChange('trainingReminders')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-#CCFF00"
                      style={{ backgroundColor: notificationSettings.trainingReminders ? '#CCFF00' : '#333' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#111' }}>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ color: '#CCFF00' }} />
                    <div>
                      <div className="font-medium text-sm">训练完成通知</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>完成训练后收到总结</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.workoutCompletion}
                      onChange={() => handleNotificationChange('workoutCompletion')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-#CCFF00"
                      style={{ backgroundColor: notificationSettings.workoutCompletion ? '#CCFF00' : '#333' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#111' }}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" style={{ color: '#CCFF00' }} />
                    <div>
                      <div className="font-medium text-sm">成就解锁通知</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>获得新成就时通知</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.achievementUnlocks}
                      onChange={() => handleNotificationChange('achievementUnlocks')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-#CCFF00"
                      style={{ backgroundColor: notificationSettings.achievementUnlocks ? '#CCFF00' : '#333' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#111' }}>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: '#CCFF00' }} />
                    <div>
                      <div className="font-medium text-sm">系统更新通知</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>接收系统更新和重要信息</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemUpdates}
                      onChange={() => handleNotificationChange('systemUpdates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-#CCFF00"
                      style={{ backgroundColor: notificationSettings.systemUpdates ? '#CCFF00' : '#333' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#111' }}>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: '#CCFF00' }} />
                    <div>
                      <div className="font-medium text-sm">邮件通知</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>通过邮件接收重要通知</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-#CCFF00"
                      style={{ backgroundColor: notificationSettings.emailNotifications ? '#CCFF00' : '#333' }}
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                style={{ 
                  background: '#CCFF00', 
                  color: '#000',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                保存设置
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-6">账号安全</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    修改密码
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        当前密码
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={securitySettings.currentPassword}
                          onChange={handleSecurityInputChange}
                          className="w-full px-4 py-3 rounded-xl text-white"
                          style={{ background: '#111', border: '1px solid #1e1e1e' }}
                          placeholder="请输入当前密码"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        新密码
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={securitySettings.newPassword}
                          onChange={handleSecurityInputChange}
                          className="w-full px-4 py-3 rounded-xl text-white"
                          style={{ background: '#111', border: '1px solid #1e1e1e' }}
                          placeholder="请输入新密码"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        密码长度至少8位，包含字母和数字
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        确认新密码
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={securitySettings.confirmPassword}
                          onChange={handleSecurityInputChange}
                          className="w-full px-4 py-3 rounded-xl text-white"
                          style={{ background: '#111', border: '1px solid #1e1e1e' }}
                          placeholder="请再次输入新密码"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.2)' }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#FFB800' }} />
                    <div>
                      <h3 className="font-medium text-sm" style={{ color: '#FFB800' }}>安全提示</h3>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        为了您的账号安全，请定期修改密码，不要使用与其他网站相同的密码，
                        并确保密码包含字母、数字和特殊字符。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                style={{ 
                  background: '#CCFF00', 
                  color: '#000',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                修改密码
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
