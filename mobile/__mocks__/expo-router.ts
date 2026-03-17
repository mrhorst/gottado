export const useRouter = () => ({
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
})

export const useLocalSearchParams = () => ({})
export const Stack = { Screen: () => null }
export const Tabs = () => null