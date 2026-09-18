import { useState } from 'react'
import { Button } from './Button'
import { Field } from './Field'

const EMPTY = { name: '', company: '', email: '', city: '' }

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Please enter a name.'
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Please enter a valid e-mail address.'
  return errors
}

// customer = null → create a new one, otherwise edit the given customer.
export function CustomerForm({ customer, onSave, onCancel }) {
  const [values, setValues] = useState(customer ?? EMPTY)
  const [submitted, setSubmitted] = useState(false)

  // Derived from the current values - no extra state needed.
  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0

  // One handler for all fields: the input's name decides which field changes.
  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    if (isValid) onSave(values)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <Field label="Name" name="name" value={values.name} onChange={handleChange} error={submitted && errors.name} autoFocus />
      <Field label="Company" name="company" value={values.company} onChange={handleChange} />
      <Field label="E-mail" name="email" type="email" value={values.email} onChange={handleChange} error={submitted && errors.email} />
      <Field label="City" name="city" value={values.city} onChange={handleChange} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
