import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  dashboardButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 45,
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
  toggleCompleteTask: {
    borderWidth: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#888',
  },
  headerContainer: {
    marginVertical: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenContainer: {
    padding: 20,
    marginTop: 50,
  },
})
export default styles
