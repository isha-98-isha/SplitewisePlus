import { useState, useEffect, useRef } from "react"
import { API_URL } from "../config"
import { Users, Plus, UserPlus, Trash2, ArrowRight, X, Info } from "lucide-react"
import ConfirmModal from "./ConfirmModal"

function Groups() {
  const [groups, setGroups] = useState([])
  const [groupName, setGroupName] = useState("")
  const [groupDesc, setGroupDesc] = useState("")
  const [memberName, setMemberName] = useState("")
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null })

  const userData = (() => {
    try { return JSON.parse(localStorage.getItem("user")) }
    catch (e) { return null }
  })()

  useEffect(() => {
    if (!userData?._id) return
    fetchGroups()
  }, [userData?._id])

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups/${userData._id}`)
      const data = await res.json()
      setGroups(Array.isArray(data) ? data.filter(Boolean) : [])
    } catch (err) { console.error(err) }
  }

  const [createStep, setCreateStep] = useState(1)
  const [draftName, setDraftName] = useState("")
  const [draftMembers, setDraftMembers] = useState([])
  const memberInputRef = useRef(null)

  const startCreate = () => {
    if (!groupName.trim()) return
    setDraftName(groupName.trim()); setDraftMembers([]); setCreateStep(2); setGroupName("")
  }

  const addDraftMember = () => {
    if (!memberName.trim()) return
    if (draftMembers.includes(memberName.trim())) return
    setDraftMembers(prev => [...prev, memberName.trim()]); setMemberName("")
  }

  const removeDraftMember = (name) => setDraftMembers(prev => prev.filter(m => m !== name))

  const finalizeCreateGroup = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/groups/create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName, description: groupDesc || "", members: draftMembers, createdBy: userData._id })
      })
      const data = await res.json()
      if (res.ok) {
        setGroups(prev => [...prev, data]); setSelectedGroup(data._id)
        window.dispatchEvent(new CustomEvent('groupsChanged', { detail: { group: data } }))
        setCreateStep(1); setDraftName(""); setDraftMembers([]); setGroupDesc("");
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (createStep === 2 && memberInputRef.current) memberInputRef.current.focus() }, [createStep])

  const handleAddMember = async (groupId) => {
    if (!memberName.trim()) return
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/add-member`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberName: memberName.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setGroups(groups.map(g => g._id === groupId ? data : g)); setMemberName("")
        window.dispatchEvent(new CustomEvent('groupsChanged', { detail: { action: 'updated', group: data } }))
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteGroup = async (groupId) => {
    setModalConfig({ isOpen: true, id: groupId })
  }

  const confirmDeleteGroup = async () => {
    const groupId = modalConfig.id
    setModalConfig({ isOpen: false, id: null })
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}`, { method: "DELETE" })
      if (res.ok) {
        setGroups(groups.filter(g => g._id !== groupId)); setSelectedGroup(null)
        window.dispatchEvent(new CustomEvent('groupsChanged', { detail: { action: 'deleted', groupId } }))
      }
    } catch (err) { console.error(err) }
  }

  const handleRemoveMember = async (groupId, memberName) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/remove-member`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberName })
      })
      const data = await res.json()
      if (res.ok) {
        setGroups(groups.map(g => g._id === groupId ? data : g))
        window.dispatchEvent(new CustomEvent('groupsChanged', { detail: { action: 'updated', group: data } }))
      }
    } catch (err) { console.error(err) }
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-amber-800/10 focus:border-amber-700 transition-all shadow-sm font-medium"

  return (
    <div className="space-y-8">
      {/* Create Group Banner */}
      <div className="bg-amber-800 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-amber-900/20 relative overflow-hidden group/card">
        <div className="relative z-10 w-full md:w-4/5">
          <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-3">
            <Users size={24} className="text-amber-200" />
            Create a Community
          </h3>

          {createStep === 1 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-base placeholder:text-white/40 text-white outline-none focus:bg-white/20 focus:border-white/40 transition-all font-bold"
                placeholder="Group name (e.g. Dream House)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startCreate()}
              />
              <button onClick={startCreate} className="px-8 py-4 bg-white text-amber-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-stone-100 transition shadow-lg flex items-center justify-center gap-2 group">
                Next <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <p className="text-sm font-black text-amber-200 uppercase tracking-widest">Step 2: Add Members to "{draftName}"</p>
              <div className="flex gap-3">
                <input ref={memberInputRef} className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-base placeholder:text-white/40 text-white outline-none focus:bg-white/20 focus:border-white/40 transition-all font-bold"
                  placeholder="Invite by name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDraftMember()}
                />
                <button onClick={addDraftMember} className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition shadow-md">
                  <Plus size={24} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {draftMembers.map(m => (
                  <span key={m} className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl text-xs font-black border border-white/20 transition-all hover:bg-white/30">
                    {m} <button onClick={() => removeDraftMember(m)} className="text-white/40 hover:text-white"><X size={14} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={() => setCreateStep(1)} className="text-white/60 text-xs font-black uppercase tracking-widest hover:text-white">Back</button>
                <button onClick={() => setCreateStep(3)} className="px-8 py-3.5 bg-white text-amber-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-100 transition shadow-lg">Finalize Info</button>
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <p className="text-sm font-black text-amber-200 uppercase tracking-widest">Final Step: Group Details</p>
              <textarea
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-base placeholder:text-white/40 text-white outline-none focus:bg-white/20 focus:border-white/40 transition-all font-bold resize-none shadow-inner"
                rows="3"
                placeholder="What is this group for? (e.g. Monthly Rent & Utilities)"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
              />
              <div className="flex gap-4 pt-2">
                <button onClick={() => setCreateStep(2)} className="text-white/60 text-xs font-black uppercase tracking-widest hover:text-white">Back</button>
                <button onClick={finalizeCreateGroup} disabled={loading} className="px-8 py-3.5 bg-white text-amber-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-100 transition shadow-lg flex items-center gap-2">
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Background Element */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl group-hover/card:scale-110 transition-transform duration-700"></div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group._id} className="bg-white rounded-3xl border border-stone-100 p-6 shadow-xl shadow-stone-200/40 hover:border-amber-200 transition-all flex flex-col group/item">
            <div className="flex justify-between items-start mb-6">
              <div className="min-w-0">
                <h4 className="text-lg font-black text-stone-900 truncate tracking-tight">{group.name}</h4>
                {group.description && (
                  <div className="flex items-center gap-1.5 mt-1 text-stone-400">
                    <Info size={12} />
                    <p className="text-xs font-medium line-clamp-1 italic">{group.description}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteGroup(group._id)}
                className="p-2.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/item:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mb-8 flex-1">
              <p className="text-[10px] font-black text-stone-400 mb-3 uppercase tracking-widest">Members ({group.members?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {(group.members || []).map(member => (
                  <span key={member} className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-50 border border-stone-100 text-stone-700 rounded-xl text-[11px] font-black transition-colors hover:bg-stone-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    {member}
                    {member !== userData.name && (
                      <button onClick={() => handleRemoveMember(group._id, member)} className="text-stone-300 hover:text-red-500 transition-colors ml-1">
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-stone-50">
              <div className="relative group/invite">
                <UserPlus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within/invite:text-amber-800 transition-colors" />
                <input
                  className={inputClass + " pl-10 !shadow-none !bg-stone-50/50"}
                  placeholder="Invite person..."
                  value={selectedGroup === group._id ? memberName : ""}
                  onChange={(e) => { setSelectedGroup(group._id); setMemberName(e.target.value) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember(group._id)}
                />
              </div>
              <button
                onClick={() => handleAddMember(group._id)}
                className="w-full py-3 bg-amber-800 text-white text-xs rounded-xl font-black uppercase tracking-widest hover:bg-amber-900 transition shadow-lg shadow-amber-900/10"
              >
                Add Friend
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
            <Users size={40} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Start by creating a shared group</p>
        </div>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title="Delete Community?"
        message="Are you sure you want to delete this group? All shared balances will be removed. This cannot be undone."
        onConfirm={confirmDeleteGroup}
        onCancel={() => setModalConfig({ isOpen: false, id: null })}
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  )
}

export default Groups
