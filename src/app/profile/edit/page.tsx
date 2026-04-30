"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  ChevronRight, Loader2, Save,
  Calendar, UserPlus
} from "lucide-react"
import { logger } from '@/lib/logger'

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
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

  // 获取完整的用户信息
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: "include"
        })
        if (response.status === 401) {
          logger.warn("User not authenticated for user data");
          router.push('/auth/signin');
        } else if (response.ok) {
          const data = await response.json()
          if (data.user?.createdAt) {
            setUserCreatedAt(data.user.createdAt)
          }
        } else {
          const text = await response.text();
          logger.warn("User data API warning:", text);
        }
      } catch (error) {
        logger.error('获取用户信息失败:', error)
      }
    }
    fetchUserData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarClick = () => {
    setShowAvatarModal(true)
  }

  const handleResetAvatar = async () => {
    setShowAvatarModal(false)
    setAvatarPreview(null)
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
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
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 100)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('请选择图片文件 (JPG, PNG, GIF, WebP)')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingAvatar(true)
    const formDataUpload = new FormData()
    formDataUpload.append('avatar', file)

    try {
      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formDataUpload,
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        logger.info('头像上传成功:', data)
      } else {
        const errorData = await response.json()
        alert('头像上传失败: ' + (errorData.error || '未知错误'))
      }
    } catch (error) {
      logger.error('头像上传失败:', error)
      alert('头像上传失败: 网络错误')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        bio: formData.bio
      }
      
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
        credentials: "include"
      })
      
      if (response.status === 401) {
        logger.warn("User not authenticated for saving profile");
        alert('请先登录再保存个人资料');
        setLoading(false);
        router.push('/auth/signin');
      } else if (response.ok) {
        const data = await response.json()
        logger.info('保存成功:', data)
        setLoading(false)
        window.location.href = '/profile'
      } else {
        const text = await response.text();
        logger.warn('保存失败:', text);
        alert('保存失败: 服务器错误\n但您可以继续使用应用')
        setLoading(false)
        router.push('/profile')
      }
    } catch (error) {
      logger.error('保存失败:', error)
      alert('保存失败: 网络错误\n但您可以继续使用应用')
      setLoading(false)
      router.push('/profile')
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
            <h1 className="text-xl font-black">编辑个人资料</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all"
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
            保存
          </button>
        </header>

        {/* Profile Form */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div 
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black mb-4 overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #CCFF00 0%, #8fb300 100%)',
                boxShadow: '0 0 24px rgba(204,255,0,0.25)'
              }}
            >
              {uploadingAvatar ? (
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#000' }} />
              ) : avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="头像预览" 
                  className="w-full h-full object-cover"
                />
              ) : user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="头像" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span style={{ color: '#000' }} className="text-4xl font-black">
                  {formData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </span>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">点击更换</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>点击头像更换图片</p>
          </div>

          {/* Avatar Modal */}
          {showAvatarModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowAvatarModal(false)}>
              <div className="rounded-2xl p-6 w-80" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-center">更换头像</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleUploadClick}
                    className="w-full py-3 rounded-xl font-bold text-black transition-all"
                    style={{ background: '#CCFF00' }}
                  >
                    上传头像
                  </button>
                  <button
                    onClick={handleResetAvatar}
                    className="w-full py-3 rounded-xl font-bold transition-all"
                    style={{ background: '#111', border: '1px solid #1e1e1e', color: 'rgba(255,255,255,0.7)' }}
                  >
                    恢复默认头像
                  </button>
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="w-full py-3 rounded-xl font-bold transition-all"
                    style={{ background: 'rgba(255,59,92,0.08)', color: '#FF3B5C', border: '1px solid rgba(255,59,92,0.2)' }}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  姓名
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                  placeholder="请输入姓名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                  placeholder="请输入邮箱"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  年龄
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                  placeholder="请输入年龄"
                  min="1"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  性别
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}
                >
                  <option value="">请选择</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                个人简介
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-white"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
                placeholder="介绍一下自己吧..."
              />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
          <h2 className="text-lg font-bold mb-4">账号信息</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#111' }}>
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5" style={{ color: '#CCFF00' }} />
                <span className="text-sm">账号创建时间</span>
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#111' }}>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" style={{ color: '#CCFF00' }} />
                <span className="text-sm">最后登录时间</span>
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {new Date().toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
