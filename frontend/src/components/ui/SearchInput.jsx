import { useState, useEffect } from 'react'
import styles from './SearchInput.module.css'

export default function SearchInput({ onChange }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const t = setTimeout(() => onChange(value), 300)
    return () => clearTimeout(t)
  }, [value, onChange])

  return (
    <input
      className={styles.input}
      type="text"
      placeholder="buscar por nombre, alias, origen o tag..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
