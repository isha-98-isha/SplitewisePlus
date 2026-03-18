import { useState, useEffect } from "react"
import { API_URL } from "../config"
import ConfirmModal from "./ConfirmModal"

function AddExpense({ onAdd }) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")
  const [splitPeople, setSplitPeople] = useState([])
  const [personName, setPersonName] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState("")
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
  })

  const showAlert = (title, message, type = "warning") => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    })
  }

  const user = JSON.parse(localStorage.getItem("user")) || {}

  useEffect(() => {
    if (!user?._id) return
    const fetchGroups = async () => {
      try {
        const res = await fetch(`${API_URL}/groups/${user._id}`)
        const data = await res.json()
        setGroups(data)
      } catch (err) { console.error(err) }
    }
    fetchGroups()

    const onGroupsChanged = (e) => {
      const d = e?.detail || {}
      if (d.action === 'deleted' && d.groupId) {
        setGroups(prev => prev.filter(g => g._id !== d.groupId))
        if (selectedGroup === d.groupId) setSelectedGroup("")
        return
      }
      if (d.group) {
        setGroups(prev => {
          if (prev.find(g => g._id === d.group._id)) return prev
          return [...prev, d.group]
        })
        setSelectedGroup(d.group._id)
      } else { fetchGroups() }
    }
    window.addEventListener('groupsChanged', onGroupsChanged)
    return () => window.removeEventListener('groupsChanged', onGroupsChanged)
  }, [user?._id])

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId)
    if (groupId) {
      const group = groups.find(g => g._id === groupId)
      if (group) setSplitPeople((group.members || []).filter(m => m !== user.name))
    } else { setSplitPeople([]) }
  }

  useEffect(() => {
    if (!selectedGroup) return setSplitPeople([])
    const g = groups.find(x => x._id === selectedGroup)
    if (g) setSplitPeople((g.members || []).filter(m => m !== user.name))
  }, [selectedGroup, groups, user.name])

  const addPersonToSplit = () => {
    if (!personName.trim()) return showAlert("Missing Name", "Please enter a name for the person you want to add.")
    if (splitPeople.find(p => p.toLowerCase() === personName.toLowerCase())) return showAlert("Already Added", "This person is already in the split list.")
    setSplitPeople([...splitPeople, personName.trim()])
    setPersonName("")
  }

  const removePersonFromSplit = (name) => setSplitPeople(splitPeople.filter(p => p !== name))

  const handleAdd = async () => {
    if (!title || !amount || !category) return showAlert("Required Fields", "Please fill in the Title, Amount, and Category to continue.")
    if (!paidBy) return showAlert("Who Paid?", "Please select who originally paid for this expense.")
    const totalPeople = splitPeople.length + 1
    const amountPerPerson = Number(amount) / totalPeople
    const splitWith = splitPeople.map(name => ({ name, amount: parseFloat(amountPerPerson.toFixed(2)) }))

    const newExpense = {
      title: title.trim(), amount: Number(amount), category, paidBy,
      userId: user._id || user.id,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      notes: notes.trim() || "", splitWith, totalSplit: totalPeople,
      groupId: selectedGroup || null
    }

    try {
      const res = await fetch(`${API_URL}/expenses/add`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newExpense),
      })
      const data = await res.json()
      if (!res.ok) { showAlert("Error", data.message || "Something went wrong while adding the expense.", "danger"); return }
      onAdd(data)
      setTitle(""); setAmount(""); setCategory(""); setDate(""); setNotes("")
      setSplitPeople([]); setPersonName(""); setPaidBy(""); setSelectedGroup("")
    } catch (err) { console.error(err); showAlert("Connection Error", "We couldn't reach the server. Please check your connection.", "danger") }
  }

  const inputStyle = { border: "1px solid #E2E8F0", background: "#F8FAFC" }

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4" style={{ color: "#1E293B" }}>Add Expense</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <input placeholder="Title *" className="p-2.5 rounded-xl text-sm w-full outline-none" style={inputStyle}
          value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="number" placeholder="Amount *" className="p-2.5 rounded-xl text-sm w-full outline-none" style={inputStyle}
          value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input type="date" className="p-2.5 rounded-xl text-sm w-full outline-none" style={inputStyle}
          value={date} onChange={(e) => setDate(e.target.value)} />
        <select className="p-2.5 rounded-xl text-sm w-full outline-none" style={inputStyle}
          value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          <option value="">Who Paid? *</option>
          <option value={user.name}>{user.name} (Me)</option>
          {splitPeople.map(person => <option key={person} value={person}>{person}</option>)}
        </select>
        <select className="p-2.5 rounded-xl text-sm w-full outline-none" style={inputStyle}
          value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category *</option>
          <option value="Food">🍔 Food & Dining</option>
          <option value="Travel">✈️ Travel & Transport</option>
          <option value="Shopping">🛍️ Shopping</option>
          <option value="Entertainment">🎬 Entertainment</option>
          <option value="Utilities">💡 Utilities</option>
          <option value="Healthcare">⚕️ Healthcare</option>
          <option value="Education">📚 Education</option>
          <option value="Rent">🏠 Rent</option>
          <option value="Gym">💪 Gym & Fitness</option>
          <option value="Other">❓ Other</option>
        </select>
      </div>

      <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
        className="w-full rounded-xl p-2.5 mb-3 text-sm outline-none" rows="2" style={inputStyle} />

      <select className="p-2.5 rounded-xl text-sm w-full mb-3 outline-none" style={inputStyle}
        value={selectedGroup} onChange={(e) => handleGroupSelect(e.target.value)}>
        <option value="">Select Group (Optional)</option>
        {groups.map(group => <option key={group._id} value={group._id}>{group.name}</option>)}
      </select>

      {/* Split Section */}
      <div className="rounded-xl p-4 mb-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <p className="font-medium text-sm mb-2" style={{ color: "#334155" }}>Split With (Optional)</p>
        <div className="flex gap-2 mb-2">
          <input placeholder="Person name" value={personName} onChange={(e) => setPersonName(e.target.value)}
            className="flex-1 p-2.5 rounded-lg text-sm outline-none" style={{ border: "1px solid #E2E8F0", background: "#FFFFFF" }}
            onKeyPress={(e) => e.key === 'Enter' && addPersonToSplit()} />
          <button type="button" onClick={addPersonToSplit} className="text-white px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#6366F1" }}>Add</button>
        </div>
        {splitPeople.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {splitPeople.map(person => (
              <span key={person} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                {person}
                <button type="button" onClick={() => removePersonFromSplit(person)} className="ml-0.5 font-bold" style={{ color: "#EF4444" }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleAdd} className="w-full text-white py-3 rounded-xl font-semibold text-sm transition-all"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(99,102,241,0.3)" }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
      >
        Add Expense
      </button>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        confirmText="Got it"
        type={modalConfig.type}
      />
    </div>
  )
}

export default AddExpense
