use std::fs;

pub fn read_file(file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(file_path)?;
    Ok(content)
}

pub fn log_message(message: &str) {
    println!("[LOG]: {}", message);
}