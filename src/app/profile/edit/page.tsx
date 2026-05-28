"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  ChevronRight, Loader2, Save,
  Calendar, UserPlus
} from "lucide-react"
import { logger } from '@/lib/logger'
import { useToast } from '@/components/Toast'
import { PageShell, PageHeader, PageContent } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [userCreatedAt, setUserCreatedAt] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    bio: ''
  })

  const user = session?.user

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        age: (session.user as any).age ? String((session.user as any).age) : '',
        gender: (session.user as any).gender || '',
        bio: (session.user as any).bio || ''
      })
      if ((session.user as any).createdAt) {
        setUserCreatedAt((session.user as any).createdAt)
      }
    }
  }, [session])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: "include" })
        if (response.status === 401) {
          logger.warn("User not authenticated for user data")
          router.push('/auth/signin')
        } else if (response.ok) {
          const data = await response.json()
          if (data.user?.createdAt) setUserCreatedAt(data.user.createdAt)
        } else {
          const text = await response.text()
          logger.warn("User data API warning:", text)
        }
      } catch (error) {
        logger.error('获取用户信息失败:', error)
      }
    }
    fetchUserData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarClick = () => setShowAvatarModal(true)

  const handleResetAvatar = async () => {
    setShowAvatarModal(false)
    setAvatarPreview(null)
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: null }),
        credentials: "include"
      })
      if (response.ok) {
        logger.info('头像已重置')
        window.location.href = '/profile'
      }
    } catch (error) {
      logger.error('重置头像失败:', error)
    }
  }

  const handleUploadClick = () => {
    setShowAvatarModal(false)
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({ message: '请选择图片文件 (JPG/PNG/GIF/WebP)', type: 'error' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ message: '图片大小不能超过 2MB', type: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setUploadingAvatar(true)
    const formDataUpload = new FormData()
    formDataUpload.append('avatar', file)
    try {
      const response = await fetch('/api/auth/avatar', { method: 'POST', body: formDataUpload, credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        logger.info('头像上传成功:', data)
        if (data?.avatar) {
          // 立即更新 NextAuth session，避免返回个人中心后仍显示旧头像
          await update({ avatar: data.avatar } as any)
          // 用线上 URL 覆盖本地预览，确保刷新后也一致
          setAvatarPreview(data.avatar)
        }
      } else {
        const errorData = await response.json()
        toast({ message: '头像上传失败：' + (errorData.error || '未知错误'), type: 'error' })
      }
    } catch (error) {
      logger.error('头像上传失败:', error)
      toast({ message: '头像上传失败，请检查网络', type: 'error' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData = { name: formData.name, email: formData.email, age: formData.age, gender: formData.gender, bio: formData.bio }
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: "include"
      })
      if (response.status === 401) {
        logger.warn("User not authenticated for saving profile")
        router.push('/auth/signin')
      } else if (response.ok) {
        logger.info('保存成功:', await response.json())
        // 同步刷新 session 中的用户字段（避免回到个人中心仍显示旧数据）
        await update({
          name: updateData.name,
          email: updateData.email,
        } as any)
        window.location.href = '/profile'
      } else {
        logger.warn('保存失败:', await response.text())
        toast({ message: '保存失败，请重试', type: 'error' })
        router.push('/profile')
      }
    } catch (error) {
      logger.error('保存失败:', error)
      toast({ message: '保存失败，请检查网络', type: 'error' })
      router.push('/profile')
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
          <div className="text-center space-y-6">
            <p className="text-muted-foreground">请先登录</p>
            <Button onClick={() => router.push('/auth/signin')} size="lg">立即登录</Button>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="编辑个人资料"
        onBack={() => router.back()}
        action={
          <Button onClick={handleSave} disabled={loading} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存
          </Button>
        }
      />
      <PageContent>

        {/* Profile Form */}
        <Card className="mb-6">
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center pt-2">
              <div
                onClick={handleAvatarClick}
                className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black mb-4 overflow-hidden cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', boxShadow: '0 0 24px var(--accent-dim)' }}
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-text)' }} />
                ) : avatarPreview ? (
                  <img src={avatarPreview} alt="头像预览" className="w-full h-full object-cover" />
                ) : user.avatar ? (
                  <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black" style={{ color: 'var(--accent-text)' }}>
                    {formData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">点击更换</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileChange} className="hidden" />
              <p className="text-sm">点击头像更换图片</p>
            </div>

            {/* Avatar Dialog */}
            <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">更换头像</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 p-5 pt-0">
                  <Button onClick={handleUploadClick} className="w-full">上传头像</Button>
                  <Button onClick={handleResetAvatar} variant="secondary" className="w-full">恢复默认头像</Button>
                  <Button onClick={() => setShowAvatarModal(false)} variant="ghost" className="w-full">取消</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="请输入姓名" />
              </div>
              <div className="space-y-2">
                <Label>邮箱</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="请输入邮箱" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>年龄</Label>
                <Input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="请输入年龄" min="1" max="120" />
              </div>
              <div className="space-y-2">
                <Label>性别</Label>
                <Select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="">请选择</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>个人简介</Label>
              <Textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="介绍一下自己吧…" />
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>账号信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5" />
                <span className="text-sm">账号创建时间</span>
              </div>
              <span className="text-sm">
                {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">最后登录时间</span>
              </div>
              <span className="text-sm">
                {new Date().toLocaleString('zh-CN')}
              </span>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageShell>
  )
}
