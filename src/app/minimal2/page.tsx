export default function Minimal2Page() {
  return (
    <div>
      <p>minimal2 outside group</p>
      <form
        action={async () => {
          "use server";
          console.log("minimal2 action ran");
        }}
      >
        <button className="border p-2">run</button>
      </form>
    </div>
  );
}