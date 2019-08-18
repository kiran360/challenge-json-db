const fs = require('fs')
const fsPromises = fs.promises
const DATA_DIRECTORY = `${process.env.NODE_ENV === 'test' ? 'data_test' : 'data'}`

module.exports = {
  getHealth,
  putStudent,
  getStudent,
  deleteStudent
}

async function getHealth (req, res, next) {
  res.json({ success: true })
}

async function putStudent (req, res, next) {
  const { studentId, props } = req.params
  let studentProps = props.split('/').filter(Boolean)
  const value = req.body
  try {
    let { err, data } = await getStudentFromStore(studentId)
    if (err) ({ err, data } = await writeStudentToStore(studentId, {}))
    const updatedStudentData = setObj(data, studentProps, value)
    const { err: writeErr } = await writeStudentToStore(studentId, updatedStudentData)
    if (writeErr) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getStudent (req, res, next) {
  const { studentId, props } = req.params
  const studentProps = props.split('/').filter(Boolean)
  try {
    let { err, data } = await getStudentFromStore(studentId)
    if (err) return res.status(404).json({ error: err.message })
    const value = getObj(data, studentProps)
    if (!value) return res.status(404).json({ error: 'students property not found' })
    res.json({ success: true, data: value })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function deleteStudent (req, res, next) {
  const { studentId, props } = req.params
  const studentProps = props.split('/').filter(Boolean)
  try {
    let { err, data } = await getStudentFromStore(studentId)
    if (err) return res.status(404).json({ error: err.message })

    const value = getObj(data, studentProps)
    if (!value) return res.status(404).json({ error: 'students property not found to delete' })
    const updatedStudentData = deleteObj(data, studentProps)
    const { err: writeErr } = await writeStudentToStore(studentId, updatedStudentData)
    if (writeErr) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getStudentFromStore (studentId) {
  const filePath = `./${DATA_DIRECTORY}/${studentId}.json`
  try {
    let data = await fsPromises.readFile(filePath, 'utf-8')
    return { err: null, data: JSON.parse(data) }
  } catch (error) {
    return { err: new Error("student doesn't exist"), data: null }
  }
}

async function writeStudentToStore (studentId, studentData) {
  const filePath = `./${DATA_DIRECTORY}/${studentId}.json`
  try {
    await fsPromises.writeFile(filePath, JSON.stringify(studentData), 'utf-8')
    return { err: null, data: studentData }
  } catch (error) {
    return { err: new Error('internal processing error'), data: null }
  }
}

function setObj (object, keys, value) {
  const attr = keys.shift()
  if (keys.length === 0) {
    object[attr] = value
    return object
  }
  object[attr] = setObj(object[attr] || {}, keys, value)
  return object
}

const getObj = (object, keys) => keys.reduce((accum, attr) => {
  return accum ? accum[attr] : null
}, object)

const deleteObj = (object, keys) => {
  const attr = keys.shift()
  if (keys.length === 0) {
    delete object[attr]
    return object
  }
  object[attr] = deleteObj(object[attr] || {}, keys)
  return object
}
