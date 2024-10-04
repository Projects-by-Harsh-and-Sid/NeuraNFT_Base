# NeuraNFT_Tron


for windows use wsl



### Basic Setup

```
conda create -n tron_neuranft python=3.12

conda activate tron_neuranft

```

### Update node

```
conda update -n base -c defaults conda
```

### Install node
```
conda install conda-forge::nodejs

conda install -c "conda-forge/label/main/linux-64" nodejs==22.9.0=hf235a45_0
```
# Get path and version of node
```
node -v

npm config get prefix
```