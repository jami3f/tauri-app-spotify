// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose, Engine as _};
use dotenv::dotenv;
use reqwest::blocking::Client;
use tauri::{PhysicalPosition, SystemTray, Window};
use tauri_plugin_oauth::{start_with_config, OauthConfig};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

#[tauri::command]
async fn start_server(window: Window) -> Result<u16, String> {
    let server = start_with_config(
        OauthConfig {
            ports: Some(vec![8888]),
            response: None,
        },
        move |url| {
            // Because of the unprotected localhost port, you must verify the URL here.
            // Preferebly send back only the token, or nothing at all if you can handle everything else in Rust.
            let code = url.split('=').collect::<Vec<&str>>()[1];
            println!("Code: {}", code);
            let token = get_token(code);
            println!("Token: {}\nRefresh: {}", token.0, token.1);
            let _ = window.emit("redirect_uri", (token.0, token.1));
        },
    )
    .map_err(|err| err.to_string());
    server
}

fn get_token(code: &str) -> (String, String) {
    dotenv().ok();
    let client_id = std::env::var("CLIENT_ID").expect("Error: CLIENT_ID must be set");
    let client_secret = std::env::var("CLIENT_SECRET").expect("Error: CLIENT_SECRET must be set");
    let client = Client::new();
    let params = [
        ("grant_type", "authorization_code"),
        ("code", code),
        ("redirect_uri", "http://localhost:8888"),
    ];
    let response = client
        .post("https://accounts.spotify.com/api/token")
        .form(&params)
        .header(
            "Authorization",
            format!(
                "Basic {}",
                general_purpose::STANDARD.encode(format!("{}:{}", client_id, client_secret))
            ),
        )
        .send()
        .unwrap()
        .text()
        .unwrap();
    let access_token = serde_json::from_str::<serde_json::Value>(&response)
        .unwrap()
        .get("access_token")
        .unwrap()
        .as_str()
        .unwrap()
        .to_string();
    let refresh_token = serde_json::from_str::<serde_json::Value>(&response)
        .unwrap()
        .get("refresh_token")
        .unwrap()
        .as_str()
        .unwrap()
        .to_string();
    (access_token, refresh_token)
}

#[tauri::command]
fn get_new_token(refresh_token: &str) -> String {
    dotenv().ok();
    let client_id = std::env::var("CLIENT_ID").expect("Error: CLIENT_ID must be set");
    let client_secret = std::env::var("CLIENT_SECRET").expect("Error: CLIENT_SECRET must be set");
    let client = Client::new();
    let params = [
        ("grant_type", "refresh_token"),
        ("refresh_token", refresh_token),
    ];
    let response = client
        .post("https://accounts.spotify.com/api/token")
        .form(&params)
        .header(
            "Authorization",
            format!(
                "Basic {}",
                general_purpose::STANDARD.encode(format!("{}:{}", client_id, client_secret))
            ),
        )
        .send()
        .unwrap()
        .text()
        .unwrap();
    let token = serde_json::from_str::<serde_json::Value>(&response)
        .unwrap()
        .get("access_token")
        .unwrap()
        .to_string();
    token
}

#[tauri::command]
async fn setup(window: Window) -> Result<(), String> {
    // let logical_size = LogicalSize::new(600.0, 400.0);
    // window.set_size(Size::new(logical_size)).unwrap();
    let available_monitors = window.available_monitors().unwrap();

    let mut position_x = &available_monitors[0].size().width - window.outer_size().unwrap().width;
    let mut position_y = &available_monitors[0].size().height
        - window.outer_size().unwrap().height
        - (48 as f64 * &available_monitors[0].scale_factor()) as u32;

    if available_monitors.len() > 1 {
        position_x = available_monitors[1].position().x as u32;
        position_y = &available_monitors[1].size().height
            - window.outer_size().unwrap().height
            - (48 as f64 * &available_monitors[1].scale_factor()) as u32;
    }
    let position = PhysicalPosition::new(position_x, position_y);

    window.set_position(position).unwrap();
    Ok(())
}

#[tauri::command]
fn get_client_id() -> String {
    dotenv().ok();
    std::env::var("CLIENT_ID").expect("Error: CLIENT_ID must be set")
}

fn main() {
    let tray = SystemTray::new();

    tauri::Builder::default()
        .system_tray(tray)
        .invoke_handler(tauri::generate_handler![
            start_server,
            setup,
            get_client_id,
            get_new_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
