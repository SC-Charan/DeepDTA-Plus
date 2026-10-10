import os
os.environ['PYTHONHASHSEED'] = '0'
import numpy as np
import tensorflow as tf
import random as rn

np.random.seed(1)
rn.seed(1)

session_conf = tf.ConfigProto(intra_op_parallelism_threads=1, inter_op_parallelism_threads=1)
import keras
from keras import backend as K
tf.set_random_seed(0)
sess = tf.Session(graph=tf.get_default_graph(), config=session_conf)
K.set_session(sess)

import sys
sys.path.append('source')
from datahelper import *
from run_experiments import build_combined_categorical, cindex_score
import argparse
from keras.callbacks import ModelCheckpoint

def train_model(dataset_name, dataset_path, max_seq_len, max_smi_len):
    print(f"Loading {dataset_name} dataset...")
    
    class FLAGS:
        charsmiset_size = 64
        charseqset_size = 25
        max_smi_len = max_smi_len
        max_seq_len = max_seq_len
        
    dataset = DataSet(dataset_path, 1, max_seq_len, max_smi_len)
    
    # parse_data expects FLAGS object that has dataset_path, is_log etc.
    class ParseFLAGS:
        dataset_path = dataset_path
        is_log = True if dataset_name == 'davis' else False # As per paper/repo code usually davis is logged
        
    XD, XT, Y = dataset.parse_data(ParseFLAGS())

    label_row_inds, label_col_inds = np.where(np.isnan(Y)==False)
    
    # Prepare all pairs
    drugs, prots,  Y_vals = prepare_interaction_pairs(XD, XT, Y, label_row_inds, label_col_inds)
    
    print(f"Dataset has {len(Y_vals)} interactions.")

    NUM_FILTERS = 32
    FILTER_LENGTH1 = 4
    FILTER_LENGTH2 = 8
    
    model = build_combined_categorical(FLAGS, NUM_FILTERS, FILTER_LENGTH1, FILTER_LENGTH2)
    
    # Checkpoint to save model
    filepath = f"model_{dataset_name}.h5"
    checkpoint = ModelCheckpoint(filepath, monitor='loss', verbose=1, save_best_only=True, mode='min')
    
    print(f"Training {dataset_name} model...")
    # Train for just 10 epochs for demonstration/quick training to get weights
    model.fit([np.array(drugs), np.array(prots)], np.array(Y_vals), 
              batch_size=256, epochs=5, callbacks=[checkpoint])
    
    print(f"Model saved to {filepath}")


if __name__ == "__main__":
    train_model('davis', 'data/davis/', max_seq_len=1200, max_smi_len=85)
    train_model('kiba', 'data/kiba/', max_seq_len=1000, max_smi_len=100)
