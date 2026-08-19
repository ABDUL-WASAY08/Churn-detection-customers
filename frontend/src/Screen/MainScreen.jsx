import { UrlInputForm } from '../Components/InputForm'
import { Tree } from '../Components/Tree'
import { Navbar } from '../Components/navBar'
import { StatusCard } from '../Components/StatusCard'

function MainScreen() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                <UrlInputForm />
                <StatusCard />
                <Tree />
            </main>
        </div>
    )
}

export default MainScreen