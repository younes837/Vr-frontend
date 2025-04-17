'use client'

import { useState, useEffect } from "react"

export default function CodeSearch() {
  const [codes, setCodes] = useState([])
  const [search, setSearch] = useState('')
  const [filteredCodes, setFilteredCodes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/search_code')
        const data = await response.json()
        setCodes(data)
        setFilteredCodes(data)
      } catch (error) {
        console.error('Error fetching codes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCodes()
  }, [])

  const handleSearch = (e) => {
    const searchNumber = e.target.value.toLowerCase()
    setSearch(searchNumber)
    
    // Filter codes based on just the number part
    setFilteredCodes(
      codes.filter(code => {
        const codeNumber = code.CODE.split('-')[1] // Get the number after F08CODE-
        return codeNumber.includes(searchNumber)
      })
    )
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4">
      <input 
        type="text" 
        placeholder="Chercher par code (ex: 99, 67)" 
        onChange={handleSearch}
        className="p-2 border rounded mb-4 w-[400px]"
        value={search}
      />  
      {search && (
        <div className="w-[400px] h-fit max-h-[300px] overflow-y-auto border rounded">
          <div className="space-y-2 p-2">
            {filteredCodes.length > 0 ? (
              filteredCodes.map(code => (
                <div key={code.CODE} className="p-2 border rounded hover:bg-gray-50">
                  {code.CODE}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">Aucun résultat trouvé</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
