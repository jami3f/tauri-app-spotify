// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use reqwest;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_currently_playing() -> str {
    ""
}

#[tauri::command]
fn get_request() -> serde_json::Value {
    // let client = reqwest::Client::blocking::new();
    let res = reqwest::blocking::get("https://dummyjson.com/products");
    let json = res.unwrap().json::<serde_json::Value>().unwrap();
    json
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
