import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Input, Embedding, Conv1D, GlobalMaxPooling1D, Dense, Dropout, concatenate
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint

import sys
sys.path.append('source')
from datahelper import *
import math

def build_model(max_smi_len, max_seq_len, charsmiset_size, charseqset_size):
    NUM_FILTERS = 32
    FILTER_LENGTH1 = 4
    FILTER_LENGTH2 = 8

    XDinput = Input(shape=(max_smi_len,), dtype='int32')
    XTinput = Input(shape=(max_seq_len,), dtype='int32')

    encode_smiles = Embedding(input_dim=charsmiset_size+1, output_dim=128, input_length=max_smi_len)(XDinput) 
    encode_smiles = Conv1D(filters=NUM_FILTERS, kernel_size=FILTER_LENGTH1, activation='relu', padding='valid')(encode_smiles)
    encode_smiles = Conv1D(filters=NUM_FILTERS*2, kernel_size=FILTER_LENGTH1, activation='relu', padding='valid')(encode_smiles)
    encode_smiles = Conv1D(filters=NUM_FILTERS*3, kernel_size=FILTER_LENGTH1, activation='relu', padding='valid')(encode_smiles)
    encode_smiles = GlobalMaxPooling1D()(encode_smiles)

    encode_protein = Embedding(input_dim=charseqset_size+1, output_dim=128, input_length=max_seq_len)(XTinput)
    encode_protein = Conv1D(filters=NUM_FILTERS, kernel_size=FILTER_LENGTH2, activation='relu', padding='valid')(encode_protein)
    encode_protein = Conv1D(filters=NUM_FILTERS*2, kernel_size=FILTER_LENGTH2, activation='relu', padding='valid')(encode_protein)
    encode_protein = Conv1D(filters=NUM_FILTERS*3, kernel_size=FILTER_LENGTH2, activation='relu', padding='valid')(encode_protein)
    encode_protein = GlobalMaxPooling1D()(encode_protein)

    encode_interaction = concatenate([encode_smiles, encode_protein], axis=-1)

    FC1 = Dense(1024, activation='relu')(encode_interaction)
    FC2 = Dropout(0.1)(FC1)
    FC2 = Dense(1024, activation='relu')(FC2)
    FC2 = Dropout(0.1)(FC2)
    FC2 = Dense(512, activation='relu')(FC2)

    predictions = Dense(1, kernel_initializer='normal')(FC2)

    model = Model(inputs=[XDinput, XTinput], outputs=[predictions])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

def prepare_interaction_pairs_tf2(XD, XT, Y, rows, cols):
    drugs = []
    prots = []
    affinity = []
    
    for pair_ind in range(len(rows)):
        drug = XD[rows[pair_ind]]
        drugs.append(drug)
        
        prot = XT[cols[pair_ind]]
        prots.append(prot)
        
        affinity.append(Y[rows[pair_ind], cols[pair_ind]])
        
    return drugs, prots, affinity

def train_model(dataset_name, dataset_path, max_seq_len, max_smi_len):
    print(f"\n--- Training for {dataset_name} ---")
    
    class ParseFLAGS:
        dataset_path = dataset_path
        is_log = True if dataset_name == 'davis' else False
        
    dataset = DataSet(dataset_path, 1, max_seq_len, max_smi_len)
    XD, XT, Y = dataset.parse_data(ParseFLAGS())

    # Get rows and columns where Y is not NaN
    label_row_inds, label_col_inds = np.where(np.isnan(Y)==False)
    
    drugs, prots, Y_vals = prepare_interaction_pairs_tf2(XD, XT, Y, label_row_inds, label_col_inds)
    
    print(f"Dataset has {len(Y_vals)} interactions.")

    model = build_model(max_smi_len, max_seq_len, dataset.charsmiset_size, dataset.charseqset_size)
    
    filepath = f"model_{dataset_name}.keras"
    checkpoint = ModelCheckpoint(filepath, monitor='loss', verbose=1, save_best_only=True, mode='min')
    
    # Train for just 1 epoch since this is just a quick run for demonstration.
    # To get a good model, this should be higher (e.g., 100).
    model.fit([np.array(drugs), np.array(prots)], np.array(Y_vals), 
              batch_size=256, epochs=1, callbacks=[checkpoint])
    
    print(f"Model saved to {filepath}")

if __name__ == "__main__":
    train_model('davis', 'data/davis/', max_seq_len=1200, max_smi_len=85)
    train_model('kiba', 'data/kiba/', max_seq_len=1000, max_smi_len=100)
