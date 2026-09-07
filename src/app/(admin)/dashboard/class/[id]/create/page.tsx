export default function CreatePage(){
    return(
        <main className="flex justify-center items-center h-screen">
            <form className="flex flex-col gap-4 max-w-sm">
                <label>Topic Name</label>
                <input className="rounded border p-1" placeholder="Introduction To Scratch"/>
                <input className="rounded border p-1" placeholder="class Description"/>
                <label>Date</label>
                <input className="rounded border p-1" type="date"/>
                <label>File</label>
                <input className="rounded border p-1" type="file"/>
                 <span> 
                   <p>use AI to generated class description </p>
                   <input className="rounded border p-1" type="checkbox"/> 
                 </span>
            </form>
        </main>
    );
}