"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import {
  ChevronRight, Bell, Shield, Loader2, Save,
  Mail, Calendar, BellOff, ShieldCheck, Key,
  Eye, EyeOff, AlertTriangle, Gauge, Beef, Wheat, Droplets
} from "lucide-react"
import { logger } from '@/lib/logger'
import { useEffect } from 'react'
import { useTheme } from "@/contexts/ThemeContext"
import { PageShell, PageHeader, PageContent } from "@/components/layout"

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'notifications'
  const { t } = useTheme()
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
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 营养目标设置
  const [nutritionTargets, setNutritionTargets] = useState({
    targetCalories: 2000,
    targetProtein: 60,
    targetCarbs: 250,
    targetFat: 65,
    waterGoal: 2500,
  })
  const [nutritionLoading, setNutritionLoading] = useState(false)
  const [nutritionSaved, setNutritionSaved] = useState(false)

  // 公式：总热量 = 碳水×4 + 蛋白质×4 + 脂肪×9
  const calcCalories = (p: number, c: number, f: number) => Math.round(c * 4 + p * 4 + f * 9)

  const handleMacroChange = (field: 'targetProtein' | 'targetCarbs' | 'targetFat', value: number) => {
    setNutritionTargets(prev => {
      const next = { ...prev, [field]: value }
      next.targetCalories = calcCalories(next.targetProtein, next.targetCarbs, next.targetFat)
      return next
    })
  }

  const handleCaloriesChange = (newCal: number) => {
    setNutritionTargets(prev => {
      const currentCal = calcCalories(prev.targetProtein, prev.targetCarbs, prev.targetFat)
      if (currentCal <= 0 || newCal <= 0) {
        return { ...prev, targetCalories: newCal }
      }
      const ratio = newCal / currentCal
      return {
        ...prev,
        targetCalories: newCal,
        targetProtein: Math.round(prev.targetProtein * ratio),
        targetCarbs: Math.round(prev.targetCarbs * ratio),
        targetFat: Math.round(prev.targetFat * ratio),
      }
    })
  }

  useEffect(() => {
    fetch('/api/nutrition-goals', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setNutritionTargets({
            targetCalories: data.targetCalories ?? 2000,
            targetProtein: data.targetProtein ?? 60,
            targetCarbs: data.targetCarbs ?? 250,
            targetFat: data.targetFat ?? 65,
            waterGoal: data.waterGoal ?? 2500,
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleNutritionSave = async () => {
    setNutritionLoading(true)
    setSaveMessage(null)
    try {
      const res = await fetch('/api/nutrition-goals', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nutritionTargets)
      })
      if (res.ok) {
        setNutritionSaved(true)
        setSaveMessage({ type: 'success', text: '营养目标已保存' })
        setTimeout(() => { setNutritionSaved(false); setSaveMessage(null) }, 2000)
      } else {
        const err = await res.json().catch(() => ({}))
        setSaveMessage({ type: 'error', text: err.error || '保存失败，请重试' })
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (e) {
      logger.warn('保存营养目标失败:', e)
      setSaveMessage({ type: 'error', text: '网络异常，请重试' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setNutritionLoading(false)
    }
  }

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
    setSaveMessage(null)
    try {
      // 通知设置暂存本地（后端尚未实现通知设置API）
      localStorage.setItem('fitcoach-notification-settings', JSON.stringify(notificationSettings))
      setSaveMessage({ type: 'success', text: '通知设置已保存' })
      setTimeout(() => setSaveMessage(null), 2000)
    } catch (error) {
      logger.warn('保存失败:', error)
      setSaveMessage({ type: 'error', text: '保存失败' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setSaveMessage(null)
    if (!securitySettings.currentPassword) {
      setSaveMessage({ type: 'error', text: '请输入当前密码' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }
    if (securitySettings.newPassword.length < 6) {
      setSaveMessage({ type: 'error', text: '新密码长度至少6位' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setSaveMessage({ type: 'error', text: '两次输入的密码不一致' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securitySettings.currentPassword,
          newPassword: securitySettings.newPassword,
        })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSaveMessage({ type: 'success', text: '密码修改成功' })
        setSecuritySettings({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSaveMessage(null), 2000)
      } else {
        setSaveMessage({ type: 'error', text: data.error || '修改失败，请重试' })
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      logger.warn('修改失败:', error)
      setSaveMessage({ type: 'error', text: '网络异常，请重试' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    )
  }

  if (!user) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">请先登录</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-8 py-3 font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90"
            >
              立即登录
            </button>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader title="设置" onBack={() => router.back()} />
      <PageContent>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => router.replace('/settings?tab=notifications')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all`}
            style={{
              background: activeTab === 'notifications' ? t.surface2 : t.surface,
              border: '1px solid var(--border)',
              color: activeTab === 'notifications' ? 'var(--accent)' : t.textSec
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              <span>通知设置</span>
            </div>
          </button>
          <button
            onClick={() => router.replace('/settings?tab=nutrition')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all`}
            style={{
              background: activeTab === 'nutrition' ? t.surface2 : t.surface,
              border: '1px solid var(--border)',
              color: activeTab === 'nutrition' ? 'var(--accent)' : t.textSec
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Gauge className="w-4 h-4" />
              <span>营养目标</span>
            </div>
          </button>
          <button
            onClick={() => router.replace('/settings?tab=security')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all`}
            style={{
              background: activeTab === 'security' ? t.surface2 : t.surface,
              border: '1px solid var(--border)',
              color: activeTab === 'security' ? 'var(--accent)' : t.textSec
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>账号安全</span>
            </div>
          </button>
        </div>

        {/* 全局保存反馈 */}
        {saveMessage && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{
              background: saveMessage.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${saveMessage.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: saveMessage.type === 'success' ? '#22C55E' : '#EF4444',
            }}
          >
            {saveMessage.type === 'success' ? '✓' : '✕'} {saveMessage.text}
          </div>
        )}

        {/* Content */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {activeTab === 'notifications' ? (
            <>
              <h2 className="text-lg font-bold mb-6">通知设置</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div>
                      <div className="font-medium text-sm">训练提醒</div>
                      <div className="text-xs" style={{ color: t.textMuted }}>按时提醒您进行训练</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.trainingReminders}
                      onChange={() => handleNotificationChange('trainingReminders')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-var(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-var(--border) after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-var(--accent)"
                      style={{ backgroundColor: notificationSettings.trainingReminders ? 'var(--accent)' : 'var(--surface-2)' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div>
                      <div className="font-medium text-sm">训练完成通知</div>
                      <div className="text-xs" style={{ color: 'var(--text)' }}>完成训练后收到总结</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.workoutCompletion}
                      onChange={() => handleNotificationChange('workoutCompletion')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-var(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-var(--border) after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-var(--accent)"
                      style={{ backgroundColor: notificationSettings.workoutCompletion ? 'var(--accent)' : 'var(--surface-2)' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div>
                      <div className="font-medium text-sm">成就解锁通知</div>
                      <div className="text-xs" style={{ color: 'var(--text)' }}>获得新成就时通知</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.achievementUnlocks}
                      onChange={() => handleNotificationChange('achievementUnlocks')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-var(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-var(--border) after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-var(--accent)"
                      style={{ backgroundColor: notificationSettings.achievementUnlocks ? 'var(--accent)' : 'var(--surface-2)' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div>
                      <div className="font-medium text-sm">系统更新通知</div>
                      <div className="text-xs" style={{ color: 'var(--text)' }}>接收系统更新和重要信息</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemUpdates}
                      onChange={() => handleNotificationChange('systemUpdates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-var(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-var(--border) after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-var(--accent)"
                      style={{ backgroundColor: notificationSettings.systemUpdates ? 'var(--accent)' : 'var(--surface-2)' }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <div>
                      <div className="font-medium text-sm">邮件通知</div>
                      <div className="text-xs" style={{ color: 'var(--text)' }}>通过邮件接收重要通知</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-var(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-var(--border) after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-var(--accent)"
                      style={{ backgroundColor: notificationSettings.emailNotifications ? 'var(--accent)' : 'var(--surface-2)' }}
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                style={{ 
                  background: 'var(--accent)', 
                  color: 'var(--accent-text)',
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
          ) : activeTab === 'nutrition' ? (
            <>
              <h2 className="text-lg font-bold mb-6">营养目标</h2>
              <p className="text-sm mb-6" style={{ color: t.textMuted }}>
                设置每日营养摄入目标，首页进度条会根据你的目标显示
              </p>

              <div className="space-y-5">
                {/* 热量 */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                      <Gauge className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">每日热量</div>
                      <div className="text-xs" style={{ color: t.textMuted }}>千卡 (kcal)</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutritionTargets.targetCalories}
                    onChange={e => handleCaloriesChange(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-foreground text-lg font-bold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                  <div className="mt-2 px-1 flex items-center justify-between">
                    <span className="text-xs" style={{ color: t.textFaint }}>
                      = 碳水×4 + 蛋白质×4 + 脂肪×9
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--accent-glow)' }}>
                      {nutritionTargets.targetCarbs}×4 + {nutritionTargets.targetProtein}×4 + {nutritionTargets.targetFat}×9 = {calcCalories(nutritionTargets.targetProtein, nutritionTargets.targetCarbs, nutritionTargets.targetFat)}
                    </span>
                  </div>
                </div>

                {/* 蛋白质 */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)' }}>
                      <Beef className="w-5 h-5" style={{ color: '#4ADE80' }} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">蛋白质</div>
                      <div className="text-xs" style={{ color: t.textMuted }}>克 (g)</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutritionTargets.targetProtein}
                    onChange={e => handleMacroChange('targetProtein', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-foreground text-lg font-bold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                </div>

                {/* 碳水 */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.1)' }}>
                      <Wheat className="w-5 h-5" style={{ color: '#22D3EE' }} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">碳水化合物</div>
                      <div className="text-xs" style={{ color: t.textMuted }}>克 (g)</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutritionTargets.targetCarbs}
                    onChange={e => handleMacroChange('targetCarbs', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-foreground text-lg font-bold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                </div>

                {/* 脂肪 */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,146,60,0.1)' }}>
                      <Droplets className="w-5 h-5" style={{ color: '#FB923C' }} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">脂肪</div>
                      <div className="text-xs" style={{ color: t.textMuted }}>克 (g)</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutritionTargets.targetFat}
                    onChange={e => handleMacroChange('targetFat', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-foreground text-lg font-bold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                </div>

                {/* 饮水目标 */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                      <Droplets className="w-5 h-5" style={{ color: '#38BDF8' }} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">每日饮水</div>
                      <div className="text-xs" style={{ color: t.textMuted }}>毫升 (ml)</div>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={nutritionTargets.waterGoal}
                    onChange={e => setNutritionTargets(p => ({ ...p, waterGoal: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl text-foreground text-lg font-bold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <button
                onClick={handleNutritionSave}
                disabled={nutritionLoading}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: nutritionSaved ? '#22C55E' : 'var(--accent)',
                  color: 'var(--accent-text)',
                  opacity: nutritionLoading ? 0.7 : 1
                }}
              >
                {nutritionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : nutritionSaved ? (
                  <span>✓ 已保存</span>
                ) : (
                  <><Save className="w-4 h-4" />保存营养目标</>
                )}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-6">账号安全</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4" style={{ color: t.textSec }}>
                    修改密码
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: t.textSec }}>
                        当前密码
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={securitySettings.currentPassword}
                          onChange={handleSecurityInputChange}
                          className="w-full px-4 py-3 rounded-xl text-foreground"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                          placeholder="请输入当前密码"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: t.textMuted }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: t.textMuted }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: t.textSec }}>
                        新密码
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={securitySettings.newPassword}
                          onChange={handleSecurityInputChange}
                          className="w-full px-4 py-3 rounded-xl text-foreground"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                          placeholder="请输入新密码"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: t.textMuted }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: t.textMuted }} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs mt-1" style={{ color: t.textMuted }}>
                        密码长度至少8位，包含字母和数字
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: t.textSec }}>
                        确认新密码
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={securitySettings.confirmPassword}
                          onChange={handleSecurityInputChange}
                          className="w-full px-4 py-3 rounded-xl text-foreground"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                          placeholder="请再次输入新密码"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: t.textMuted }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: t.textMuted }} />
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
                      <p className="text-xs mt-1" style={{ color: t.textMuted }}>
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
                  background: 'var(--accent)', 
                  color: 'var(--accent-text)',
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
      </PageContent>
    </PageShell>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
