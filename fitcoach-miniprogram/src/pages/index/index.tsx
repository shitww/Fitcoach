import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {
  const handleStartWorkout = () => {
    Taro.navigateTo({
      url: '/pages/workout/index'
    })
  }

  return (
    <View className='container index-container'>
      <View className='content'>
        <Text className='title'>FitCoach</Text>
        <Text className='subtitle'>你的专属健身训练助手</Text>
        
        <Button 
          className='start-btn' 
          onClick={handleStartWorkout}
        >
          开始训练
        </Button>
      </View>
    </View>
  )
}
