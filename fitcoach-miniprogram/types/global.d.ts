// 全局类型声明

/**
 * 小程序 app.config.ts 的 defineAppConfig 类型
 */
declare function defineAppConfig(config: {
  pages: string[]
  window?: {
    backgroundTextStyle?: string
    navigationBarBackgroundColor?: string
    navigationBarTitleText?: string
    navigationBarTextStyle?: string
    backgroundColor?: string
    [key: string]: any
  }
  [key: string]: any
}): any

/**
 * 页面配置类型
 */
declare function definePageConfig(config: {
  navigationBarTitleText?: string
  [key: string]: any
}): any

/**
 * Taro 相关类型
 */
declare module '@tarojs/taro'
declare module '@tarojs/components'
declare module '@tarojs/runtime'
declare module '@tarojs/react'
declare module '@tarojs/shared'

/**
 * 全局样式类型
 */
declare module '*.scss' {
  const content: { [className: string]: string }
  export = content
}
declare module '*.css' {
  const content: { [className: string]: string }
  export = content
}
