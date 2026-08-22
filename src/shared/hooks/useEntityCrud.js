import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { exportToExcel } from '../utils/exportExcel.js'

export const FILTROS_ESTADO = [
  { value: 'todo', label: 'Todo' },
  { value: 'habilitado', label: 'Habilitado' },
  { value: 'inhabilitado', label: 'Inhabilitado' },
]

/**
 * Encapsula el patrón repetido en las pantallas Listar*: búsqueda con debounce,
 * filtro por estado (con el pill animado), orden de columnas, paginación, el
 * efecto de carga con AbortController, el salto a la página de un registro
 * resaltado (?highlight=) y el flujo de exportación a Excel. Cada pantalla
 * sigue siendo dueña de sus columnas y de cómo se obtienen/mapean sus datos.
 */
export default function useEntityCrud({
  fetchPage,
  extraDeps = [],
  highlightParam = 'highlight',
  fetchPageForHighlight,
  exportConfig,
  onExportError,
} = {}) {
  const theme = useTheme()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get(highlightParam)
  const highlightRef = useRef(null)
  const hasScrolled = useRef(false)
  const hasNavigated = useRef(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const initialLoad = useRef(true)

  const [busqueda, setBusquedaState] = useState('')
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
  const [filtroEstado, setFiltroEstadoState] = useState('todo')
  const [sortBy, setSortBy] = useState({ field: '', dir: '' })
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPageState] = useState(5)
  const [exportando, setExportando] = useState(false)

  const setBusqueda = (value) => { setBusquedaState(value); setPage(1) }
  const setFiltroEstado = (value) => { setFiltroEstadoState(value); setPage(1) }
  const setRowsPerPage = (n) => { setRowsPerPageState(n); setPage(1) }

  const filtroContainerRef = useRef(null)
  const filtroBtnRefs = useRef([])
  const [filtroPillStyle, setFiltroPillStyle] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const activeIndex = FILTROS_ESTADO.findIndex(f => f.value === filtroEstado)
    const btn = filtroBtnRefs.current[activeIndex]
    const container = filtroContainerRef.current
    if (btn && container) {
      setFiltroPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth })
    }
  }, [filtroEstado])

  useEffect(() => {
    if (highlightId && highlightRef.current && !hasScrolled.current) {
      hasScrolled.current = true
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
    }
  })

  useEffect(() => {
    if (!highlightId || hasNavigated.current || !fetchPageForHighlight) return
    hasNavigated.current = true
    fetchPageForHighlight(highlightId, rowsPerPage)
      .then(res => { if (res?.data?.page) setPage(res.data.page) })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId])

  const handleSort = (field) => {
    setSortBy(prev => {
      if (prev.field !== field) return { field, dir: 'asc' }
      if (prev.dir === 'asc') return { field, dir: 'desc' }
      return { field: '', dir: '' }
    })
    setPage(1)
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const habilitadoParam = filtroEstado === 'todo' ? undefined : filtroEstado === 'habilitado' ? 'true' : 'false'
  const queryParams = {
    page,
    limit: rowsPerPage,
    habilitado: habilitadoParam,
    q: debouncedBusqueda.trim() || undefined,
    sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
  }

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        await fetchPage(controller.signal, queryParams)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    cargar()
    return () => {
      cancelled = true
      controller.abort()
    }
    // fetchPage se pasa como closure inline en cada render (no está memoizada por el
    // caller), así que no entra en las deps: solo nos interesa reaccionar a los
    // filtros/paginación reales, no a que el componente se haya vuelto a renderizar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filtroEstado, debouncedBusqueda, sortBy, ...extraDeps])

  useEffect(() => {
    if (!loading) initialLoad.current = false
  }, [loading])

  const handleExportar = async () => {
    if (!exportConfig) return
    setExportando(true)
    try {
      const res = await exportConfig.fetchAll({
        habilitado: habilitadoParam,
        q: debouncedBusqueda.trim() || undefined,
        sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
      })
      const rows = (res?.data || []).map(exportConfig.mapRow)
      await exportToExcel({
        data: rows,
        fileName: exportConfig.fileName,
        sheetName: exportConfig.sheetName,
        themeColor: theme.palette.primary.main,
      })
    } catch (err) {
      onExportError?.(err)
    } finally {
      setExportando(false)
    }
  }

  const refetch = () => fetchPage(undefined, queryParams)

  return {
    theme,
    highlightId, highlightRef,
    loading, error, initialLoad,
    busqueda, setBusqueda, debouncedBusqueda,
    filtroEstado, setFiltroEstado,
    sortBy, handleSort,
    refetch,
    page, setPage, rowsPerPage, setRowsPerPage,
    exportando, handleExportar: exportConfig ? handleExportar : undefined,
    filtroContainerRef, filtroBtnRefs, filtroPillStyle,
  }
}
