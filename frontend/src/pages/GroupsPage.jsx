import Groups from "../components/Groups"

function GroupsPage() {
    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Communities</h1>
                <p className="text-sm text-stone-500 font-medium tracking-tight">Manage shared buckets with your trusted circles.</p>
            </div>
            <Groups />
        </div>
    )
}

export default GroupsPage
