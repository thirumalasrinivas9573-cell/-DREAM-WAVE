import PortalCrudPage from './PortalCrudPage'

/** CRUD page with a fixed promotion category pre-filled on create */
export default function CategoryCrudPage({ title, icon, theme, api, fields, columns, category, emptyHint }) {
  const wrapped = {
    ...api,
    create: (data) => api.create({ ...data, category }),
  }
  return (
    <PortalCrudPage
      title={title}
      icon={icon}
      theme={theme}
      api={wrapped}
      fields={fields.filter(f => f.key !== 'category')}
      columns={columns}
      emptyHint={emptyHint}
    />
  )
}
