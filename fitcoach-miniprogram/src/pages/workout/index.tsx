import { useState } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface WorkoutSet {
  weight: number
  reps: number
}

type InputChangeEvent = { detail: { value: string } }

export default function Workout() {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [sets, setSets] = useState<WorkoutSet[]>([])

  const handleAddSet = () => {
    const weightNum = parseFloat(weight)
    const repsNum = parseInt(reps)

    if (!weightNum || !repsNum) {
      Taro.showToast({
        title: '请输入重量和次数',
        icon: 'none'
      })
      return
    }

    const newSet: WorkoutSet = {
      weight: weightNum,
      reps: repsNum
    }

    setSets([...sets, newSet])
    setReps('')
  }

  const handleFinishWorkout = () => {
    if (sets.length === 0) {
      Taro.showToast({
        title: '请先添加训练组',
        icon: 'none'
      })
      return
    }

    Taro.navigateTo({
      url: '/pages/summary/index',
      success: (
        res: {
          eventChannel: {
            emit: (event: string, payload: { workoutData: WorkoutSet[] }) => void
          }
        }
      ) => {
        res.eventChannel.emit('sendWorkoutData', {
          workoutData: sets
        })
      }
    })
  }

  return (
    <View className='container workout-container'>
      <Text className='page-title'>训练中</Text>

      {/* 输入区域 */}
      <View className='input-section'>
        <View className='input-group'>
          <Text className='input-label'>重量 (kg)</Text>
          <Input
            className='input-field'
            type='number'
            value={weight}
            onInput={(e: InputChangeEvent) => setWeight(e.detail.value)}
            placeholder='输入重量'
            placeholderClass='input-placeholder'
          />
        </View>

        <View className='input-group'>
          <Text className='input-label'>次数</Text>
          <Input
            className='input-field'
            type='number'
            value={reps}
            onInput={(e: InputChangeEvent) => setReps(e.detail.value)}
            placeholder='输入次数'
            placeholderClass='input-placeholder'
          />
        </View>

        <Button className='add-btn' onClick={handleAddSet}>
          添加一组
        </Button>
      </View>

      {/* 训练组列表 */}
      {sets.length > 0 && (
        <View className='sets-section'>
          <Text className='section-title'>训练记录</Text>
          <ScrollView className='sets-list'>
            {sets.map((set, index) => (
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

      {/* 完成按钮 */}
      {sets.length > 0 && (
        <Button className='finish-btn' onClick={handleFinishWorkout}>
          完成训练
        </Button>
      )}
    </View>
  )
}
