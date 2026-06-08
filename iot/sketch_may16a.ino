#include <Wire.h> 

#include "MAX30105.h" 

#include "heartRate.h" 

#include <OneWire.h> 

#include <DallasTemperature.h> 

 

// Configurações do Sensor de Temperatura (DS18B20) 

const int ONE_WIRE_BUS = 4;  

OneWire oneWire(ONE_WIRE_BUS); 

DallasTemperature sensors(&oneWire); 

 

// Configurações do Sensor de Batimento (MAX30102) 

MAX30105 particleSensor; 

const byte RATE_SIZE = 4;  

byte rates[RATE_SIZE];  

byte rateSpot = 0; 

long lastBeat = 0;  

float beatsPerMinute; 

int beatAvg; 

 

void setup() { 

  Serial.begin(115200); 

  Serial.println("Iniciando Sistema..."); 

 

  // Inicializa I2C nos pinos padrão do C3 (SDA: 8, SCL: 9) 

  Wire.begin(8, 9); 

 

  // Inicializa o DS18B20 

  sensors.begin(); 

 

  // Inicializa o MAX30102 

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) { 

    Serial.println("MAX30102 não encontrado. Verifique a fiação!"); 

    while (1); 

  } 

 

  particleSensor.setup();  

  particleSensor.setPulseAmplitudeRed(0x0A); // Baixa potência para indicar atividade 

  particleSensor.setPulseAmplitudeGreen(0);  // Desliga o LED verde 

} 

 

void loop() { 

  // --- Lógica do Batimento Cardíaco --- 

  long irValue = particleSensor.getIR(); 

 

  if (checkForBeat(irValue) == true) { 

    long delta = millis() - lastBeat; 

    lastBeat = millis(); 

 

    beatsPerMinute = 60 / (delta / 1000.0); 

 

    if (beatsPerMinute < 255 && beatsPerMinute > 20) { 

      rates[rateSpot++] = (byte)beatsPerMinute;  

      rateSpot %= RATE_SIZE; 

 

      // Média das últimas leituras 

      beatAvg = 0; 

      for (byte x = 0; x < RATE_SIZE; x++) beatAvg += rates[x]; 

      beatAvg /= RATE_SIZE; 

    } 

  } 

 

  // --- Lógica da Temperatura (Lida a cada 2 segundos para não travar o loop) --- 

  static unsigned long lastTempRequest = 0; 

  if (millis() - lastTempRequest >= 2000) { 

    sensors.requestTemperatures(); 

    float tempC = sensors.getTempCByIndex(0); 

 

    Serial.print("IR: "); Serial.print(irValue); 

    if (irValue < 50000) { 

      Serial.print(" | Nenhum dado detectado"); 

    } else { 

      Serial.print(" | BPM: "); Serial.print(beatsPerMinute); 

      Serial.print(" | Media BPM: "); Serial.print(beatAvg); 

    } 

     

    Serial.print(" | Temp: "); 

    if (tempC != DEVICE_DISCONNECTED_C) { 

      Serial.print(tempC); 

      Serial.println("°C"); 

    } else { 

      Serial.println("Erro no sensor de temp."); 

    } 

     

    lastTempRequest = millis(); 

  } 

} 