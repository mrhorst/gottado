import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  dashboardButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 30,
    backgroundColor: '#78f',
  },
  dashboardButtonContainer: {
    flex: 1,
    margin: 5,
    gap: 20,
  },
  dashboardButtonText: { fontSize: 24, textAlign: 'center', fontWeight: 600 },
  tasksContainer: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  taskCard: {
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completeTaskToggle: {
    borderWidth: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#888',
  },
  headerContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenContainer: {
    padding: 20,
  },
})
export default styles
