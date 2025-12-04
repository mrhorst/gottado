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
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenContainer: {
    padding: 20,
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent grey
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 20,
  },
  roleButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 500,
  },
})

export default styles
