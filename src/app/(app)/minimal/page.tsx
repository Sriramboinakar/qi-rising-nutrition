export default function MinimalPage() {
  return (
    <div>
      <p>minimal</p>
      <form
        action={async () => {
          "use server";
        }}
      >
        <button className="border p-2">run</button>
      </form>
    </div>
  );
}