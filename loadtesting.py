from molotov import scenario

# requirement: pip install molotov
# for autosizing run: molotov --sizing loadtesting.py

# _API = "https://neo-viewer-dev.brainsimulation.eu/blockdata/?url=https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/axon/File_axon_1.abf"
# _API = "http://127.0.0.1:8000/blockdata/?url=https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/axon/File_axon_1.abf"

_API = "http://127.0.0.1:8000/api/blockdata/?url=https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/brainwaresrc/block_300ms_4rep_1clust_part_ch1.src"
# _API = "https://neo-viewer.brainsimulation.eu/api/blockdata/?url=https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/brainwaresrc/block_300ms_4rep_1clust_part_ch1.src"

@scenario(weight=100)
async def _test(session):
    async with session.get(_API) as resp:
        assert resp.status == 200, resp.status
