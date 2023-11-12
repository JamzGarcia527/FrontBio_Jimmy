const menu = [
  { heading: 'Menu Local' },
  {
    title: 'Aprobar Formulario E6',
    to: { name: 'preinscription-pending' },
    icon: { icon: 'tabler-file' },
  },
]

export default menu.map(e => ({ ...e, action: 'navigation', subject: 'menu' }))
