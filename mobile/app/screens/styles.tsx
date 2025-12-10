import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionSummaryHeading: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  pendingTaskTitle: {
    fontSize: 20,
    fontWeight: '400',
  },
  completedTaskTitle: {
    fontSize: 20,
    fontWeight: '400',
    textDecorationLine: 'line-through',
  },
  selectSectionsButton: {
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    padding: 10,
    margin: 10,
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
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#888',
  },
  completedTaskButton: {
    height: 18,
    width: 18,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  headerContainer: {
    marginTop: 15,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    marginTop: 15,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
    padding: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  sectionModalContent: {
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
  sectionsButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 20,
  },
  sectionButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
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
  sectionButtonText: {
    fontSize: 16,
    fontWeight: 600,
  },
})

export default styles
