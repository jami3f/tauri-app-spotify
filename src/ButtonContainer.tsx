export default function ButtonContainer() {
  function Button(props: { image: string }) {
    return (
      <div className="w-16 h-16 flex justify-center items-center">
        <img src={props.image} alt="button" className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 flex justify-center items-center">
      <Button image="https://i.imgur.com/8Q9QZ9u.png" />
    </div>
  );
}
