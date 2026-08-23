export default function CreatePage(){
    return(
        <main>
            <label>Topic Name</label>
            <input placeholder="Introduction To Scratch"/>
            <input placeholder="class Description"/>
            <label>Date</label>
            <input type="date"/>
            <input type="file"/>
            <p>use AI to generated class description </p>
            <input type="checkbox"/>
        </main>
    );
}