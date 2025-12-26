import api from './api'

const fetchLoggedUser = async () => {
  const { data } = await api.get('/users/me')
  return data
}

const login = async (email: string, password: string) => {
  const { data } = await api.post('/login', { email, password })
  return data
}

const createUser = async (email: string, name: string, password: string) => {
  const { data } = await api.post('/signup', { email, name, password })

  return data
}

export { fetchLoggedUser, createUser, login }
