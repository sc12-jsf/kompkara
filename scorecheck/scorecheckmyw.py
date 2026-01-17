from demucs.pretrained import get_model
import torchaudio
import torch
from demucs.apply import apply_model
import soundfile
import numpy as np 
import librosa
import json
wav= "Myway.wav"
model= None
contour= None
def load_model(): 
    global model, contour 
    if model is not None: 
        return print("Loading Demucs model...")
    
    wv, samplerate= torchaudio.load(wav)
    wv= wv.unsqueeze(0)
    with torch.no_grad():
        stems= apply_model(model,wv,device="cpu")
    stems= stems.squeeze(0)
    vocals= stems[0]
    instruments= stems[1] + stems[2] + stems[3]
    soundfile.write("vocals.wav", vocals.T, samplerate)
    soundfile.write("instruments.wav", instruments.T, samplerate)
    form, sr= librosa.load("vocals.wav")
    pitches, freq= librosa.piptrack(y=form, sr=sr)
    contour= []
    for fps in range(pitches.shape[1]):
        pitch= pitches[:,fps].max()
        length= fps*(512/sr) #hop length divided by the sample rate gets no of samples
        if pitch > 0:
            contour.append({"time":length, "pitch": pitch})
def getPitch(length, contour):
    t= min(contour, key=lambda x:abs(x["time"]-length))
    return t["pitch"]
def error(userpitch,songpitch):
    return 1200 * np.log(userpitch/songpitch)



