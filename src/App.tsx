import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { tauri } from "@tauri-apps/api";
const { invoke } = tauri;
import "./styles.css";

export interface productTypes {
  brand: string;
  category: string;
  description: string;
  discountPercentage: number;
  id: number;
  images: string[];
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  title: string;
}

function App() {
  const [elems, setElems] = useState<any[]>([]);
  const print = async () => {
    const result_string: [productTypes] = (
      await invoke<{ products: [productTypes] }>("get_request")
    ).products;
    console.log(Object.entries(result_string[0]))
    const result = result_string.map((item) =>
      Object.entries(item).map(([key, value]) => 
        key == "images" ? (
          <div className="flex">
            {value.map((src: string) => (
              <img alt="image" src={src} className="w-36 object-scale-down"/>
            ))}
          </div>
        ) : (
          <p>
            {key}:{value}
          </p>
        )
      )
    );
    // console.log(result)
    setElems(result);
  };

  useEffect(() => {
    print();
  }, []);

  return (
    <div className="border border-black w-96 h-64">
      <h1>Welcome to Tauri!</h1>
      {elems}
    </div>
  );
}

export default App;
