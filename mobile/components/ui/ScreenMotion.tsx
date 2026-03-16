import type { ReactNode } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'

const ScreenMotion = ({ children }: { children: ReactNode }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  )
}

export default ScreenMotion
