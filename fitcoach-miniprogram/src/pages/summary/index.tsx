import { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'

interface WorkoutSet {
  weight: number
  reps: number
}

export default function Summary() {
  const [workoutData, setWorkoutData] = useState<WorkoutSet[]>([])
  const [feedback, setFeedback] = useState('')

  useDidShow(() => {
    const eventChannel = Taro.getCurrentInstance().page!.getOpenerEventChannel()
    eventChannel.on('sendWorkoutData', function(data) {
      setWorkoutData(data.workoutData)
    })
  })

  const stats = useMemo(() => {
    if (workoutData.length === 0) {
      return { totalVolume: 0, maxWeight: 0, maxOneRM: 0 }
    }

    let totalVolume = 0
    let maxWeight = 0
    let maxOneRM = 0

    workoutData.forEach(set => {
      const volume = set.weight * set.reps
      totalVolume += volume
      if (set.weight > maxWeight) maxWeight = set.weight
      const oneRM = set.weight * (1 + set.reps / 30)
      if (oneRM > maxOneRM) maxOneRM = oneRM
    })

    return { 
      totalVolume, 
      maxWeight, 
      maxOneRM: Math.round(maxOneRM) 
    }
  }, [workoutData])

  useEffect(() => {
    if (workoutData.length === 0) return

    if (stats.totalVolume > 1000) {
      setFeedback('训练量较高')
    } else if (stats.maxWeight > 80) {
      setFeedback('力量提升明显')
    } else {
      setFeedback('训练完成')
    }
  }, [stats, workoutData])

  const handleBackHome = () => {
    Taro.navigateBack()
  }

  return (
    <View className='container summary-container'>
      <Text className='page-title'>训练总结</Text>

      {/* 统计卡片 */}
      <View className='stats-grid'>
        <View className='stat-card'>
          <Text className='stat-label'>总训练量</Text>
          <Text className='stat-value'>{stats.totalVolume}</Text>
          <Text className='stat-unit'>kg</Text>
        </View>
        <View className='stat-card'>
          <Text className='stat-label'>最大重量</Text>
          <Text className='stat-value'>{stats.maxWeight}</Text>
          <Text className='stat-unit'>kg</Text>
        </View>
        <View className='stat-card'>
          <Text className='stat-label'>估算 1RM</Text>
          <Text className='stat-value'>{stats.maxOneRM}</Text>
          <Text className='stat-unit'>kg</Text>
        </View>
      </View>

      {/* AI 反馈 */}
      {feedback && (
        <View className='feedback-card'>
          <Text className='feedback-text'>{feedback}</Text>
        </View>
      )}

      {/* 训练记录列表 */}
      {workoutData.length > 0 && (
        <View className='sets-section'>
          <Text className='section-title'>训练记录</Text>
          <ScrollView className='sets-list'>
            {workoutData.map((set, index) => (
              <View key={index} className='set-item'>
                <Text className='set-number'>第 {index + 1} 组</Text>
                <Text className='set-details'>
                  {set.weight} kg × {set.reps} 次
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 返回首页按钮 */}
      <Button className='home-btn' onClick={handleBackHome}>
        返回首页
      </Button>
    </View>
  )
}
