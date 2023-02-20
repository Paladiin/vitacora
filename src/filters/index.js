export const toFixed_2 = (value) => {
  if (value != null) {
    return Number(value).toFixed(2)
  }
}

function pad (val, n = 2) {
  return String(val).padStart(2, '0')
}

export const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}`
}

export const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day} ${hour}:${minutes}`
}
