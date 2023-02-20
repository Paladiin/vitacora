export const toFixed_2 = (value) => {
  if (value != null) {
    return Number(value).toFixed(2)
  }
}

function pad (val, n = 2) {
  return String(val).padStart(2, '0')
}

export const formatDate = (timestamp) =