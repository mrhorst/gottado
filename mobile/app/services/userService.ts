import api from './api'

const fetchLoggedUser = async () => {
  const { data } = await api.get('/users/me')
  return data
}

export { fetchLoggedUser }
