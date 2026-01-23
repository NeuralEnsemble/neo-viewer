"""

"""

import os.path
import urllib.parse

from fastapi.testclient import TestClient

from ..main import app


test_client = TestClient(app)


class TestGetData:
    def metadata_test(self, obj=None):
        # testing annotation data
        assert obj["annotations"] == {"abf_version": "2.4"}

        # testing description
        assert obj["description"] == ""

        # testing file_origin
        assert os.path.basename(obj["file_origin"]) == "96711008.abf"

        # testing name
        assert obj["name"] == ""

    def test_get_block_data_no_type(self):
        test_file = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf"
        params = urllib.parse.urlencode({"url": test_file})
        response = test_client.get(f"/api/blockdata/?{params}")
        assert response.status_code == 200
        json_data = response.json()

        # testing the number of block
        number_of_blocks = len(json_data["block"])
        assert number_of_blocks == 1

        # testing the number of segment
        number_of_segments = len(json_data["block"][0]["segments"])
        assert number_of_segments == 16

        # testing rec_datetime
        assert json_data["block"][0]["rec_datetime"] == "1996-07-11T17:03:40"

        # testing file_name
        assert os.path.basename(json_data["block"][0]["file_name"]) == "96711008.abf"

        # common test for block and segment
        self.metadata_test(obj=json_data["block"][0])
        for i in range(number_of_segments):
            self.metadata_test(obj=json_data["block"][0]["segments"][i])

            # specific test for segment
            # test if irregularlysampledsignal is an empty list
            assert (
                json_data["block"][0]["segments"][i]["irregularlysampledsignals"] == []
            )
            # test if analogsignals is an empty list
            assert json_data["block"][0]["segments"][i]["analogsignals"] == []
            # test if spiketrains is an empty list
            assert json_data["block"][0]["segments"][i]["spiketrains"] == []

    def test_get_segment_data_no_type(self):
        test_file = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf"
        params = urllib.parse.urlencode(
            {"url": test_file, "segment_id": 1, "format": "json"}
        )
        response = test_client.get(f"/api/segmentdata/?{params}")
        assert response.status_code == 200
        json_data = response.json()

        self.metadata_test(json_data)
        # test if irregularlysampledsignals is empty list
        assert json_data["irregularlysampledsignals"] == []
        # test if analogsignals contains 2 analogsignals
        assert json_data["analogsignals"] == [{}, {}]
        # test if spiketrains is an empty list
        assert json_data["spiketrains"] == []

    def test_get_analogsignal_data(self):
        test_file = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf"

        names = ["Channels: (Chan0mV)", "Channels: (AO#0)"]
        value_units = ["mV", "nA"]
        for analogsignal_id in range(2):
            params = urllib.parse.urlencode(
                {"url": test_file, "segment_id": 1, "analog_signal_id": analogsignal_id}
            )
            response = test_client.get(f"/api/analogsignaldata/?{params}")
            assert response.status_code == 200
            json_data = response.json()

            assert json_data["t_start"] == 4.0
            assert json_data["t_stop"] == 4.7168
            assert json_data["sampling_period"] == 0.0001
            # not tested values
            assert json_data["name"] == names[analogsignal_id]
            assert json_data["times_dimensionality"] == "s"

            assert json_data["values_units"] == value_units[analogsignal_id]

    def test_get_analogsignal_data_2(self):
        test_file = "https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/intan/intan_rhd_test_1.rhd"
        params = urllib.parse.urlencode(
            {"url": test_file, "segment_id": 0, "analog_signal_id": 0, "type": "IntanIO", "down_sample_factor": 1000}
        )
        response = test_client.get(f"/api/analogsignaldata/?{params}")
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["t_start"] == 0.0
        assert json_data["t_stop"] == 1.0
        assert json_data["sampling_period"] == 3.3333333333333335e-02
        assert json_data["name"] == "RHD2000 amplifier channel"
        assert json_data["times_dimensionality"] == "s"
        assert json_data["values_units"] == "uV"
        assert len(json_data["values"]) == 192
        assert len(json_data["values"][0]) == 30
        assert len(json_data["values"][191]) == 30

    def test_get_analogsignal_data_3(self):
        test_file = "https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/asciisignal/File_asciisignal_3.txt"
        params = urllib.parse.urlencode(
            {"url": test_file, "segment_id": 0, "analog_signal_id": 0, "type": "AsciiSignalIO"}
        )
        response = test_client.get(f"/api/analogsignaldata/?{params}")
        assert response.status_code == 400
        json_data = response.json()
        assert "Data contains NaN" in json_data["detail"]

    def test_spiketrain(self):
        test_file = "https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/neuroexplorer/File_neuroexplorer_1.nex"
        params = urllib.parse.urlencode(
            {"url": test_file, "segment_id": 0, "type": "NeuroExplorerIO"}
        )
        response = test_client.get(f"/api/spiketraindata/?{params}")
        assert response.status_code == 200
        json_data = response.json()

        expected_n_spikes = [18882, 13514, 3053, 2357, 3807, 3824]
        for i in range(6):
            assert json_data[str(i)]["units"] == "s"
            assert json_data[str(i)]["t_stop"] == 5196.196075
            assert len(json_data[str(i)]["times"]) == expected_n_spikes[i]

    def test_get_block_missing_param(self):
        # missing url test
        response = test_client.get(f"/api/blockdata/")
        assert response.status_code == 422
        assert response.json()["detail"] == [
            {
                "type": "missing",
                "loc": ["query", "url"],
                "msg": "Field required",
                "input": None,
                "url": "https://errors.pydantic.dev/2.3/v/missing",
            }
        ]
        assert (
            response.json()["error"] == "url parameter is missing"
        )  # for backwards compatibility

    def test_get_segment_missing_param(self):
        # missing url test
        response = test_client.get("/api/segmentdata/")
        assert response.status_code == 422
        assert (
            response.json()["error"]
            == "url parameter is missing, segment_id parameter is missing"
        )

        # missing segment_id
        test_file = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf"
        params = urllib.parse.urlencode({"url": test_file})
        response = test_client.get(f"/api/segmentdata/?{params}")
        assert response.status_code == 422
        assert response.json()["error"] == "segment_id parameter is missing"

        # index_error segment_id
        params = urllib.parse.urlencode({"url": test_file, "segment_id": 999})
        response = test_client.get(f"/api/segmentdata/?{params}")
        assert response.status_code == 400
        assert response.json()["error"] == "IndexError on segment_id"

    def test_get_analogsignal_missing_param(self):
        # test for missing requirement in analogsignal

        # missing url test
        response = test_client.get("/api/analogsignaldata/")
        assert response.status_code == 422
        assert (
            response.json()["error"]
            == "url parameter is missing, segment_id parameter is missing, analog_signal_id parameter is missing"
        )

        # missing segment_id
        test_file = "https://data-proxy.ebrains.eu/api/v1/buckets/pc0a33-Migliore_2018_CA1/exp_data/abf-int-bAC/Ivy_960711AHP3/96711008.abf"
        params = urllib.parse.urlencode({"url": test_file, "analog_signal_id": 0})
        response = test_client.get(f"/api/analogsignaldata/?{params}")
        assert response.status_code == 422
        assert response.json()["error"] == "segment_id parameter is missing"

        # missing analog_signal_id
        params = urllib.parse.urlencode({"url": test_file, "segment_id": 0})
        response = test_client.get(f"/api/analogsignaldata/?{params}")
        assert response.status_code == 422
        assert response.json()["error"] == "analog_signal_id parameter is missing"

        # index_error segment_id
        params = urllib.parse.urlencode(
            {"url": test_file, "segment_id": 999, "analog_signal_id": 0}
        )
        response = test_client.get(f"/api/analogsignaldata/?{params}")
        assert response.status_code == 400
        assert response.json()["error"] == "IndexError on segment_id"

        # index_error analog_signal_id
        params = urllib.parse.urlencode(
            {"url": test_file, "segment_id": 0, "analog_signal_id": 999}
        )
        response = test_client.get(f"/api/analogsignaldata/?{params}")
        assert response.status_code == 400
        assert response.json()["error"] == "IndexError on analog_signal_id"

    def test_get_spiketrain_missing_param(self):
        test_file = "https://gin.g-node.org/NeuralEnsemble/ephy_testing_data/raw/master/neuroexplorer/File_neuroexplorer_1.nex"
        # test for missing url

        params = urllib.parse.urlencode({"segment_id": 0, "type": "NeuroExplorerIO"})
        response = test_client.get(f"/api/spiketraindata/?{params}")
        assert response.status_code == 422
        assert response.json()["error"] == "url parameter is missing"

        # test for missing segment_id
        params = urllib.parse.urlencode({"url": test_file, "type": "NeuroExplorerIO"})
        response = test_client.get(f"/api/spiketraindata/?{params}")
        assert response.status_code == 422
        assert response.json()["error"] == "segment_id parameter is missing"

        # test for indexerror on segment_id
        params = urllib.parse.urlencode(
            {"url": test_file, "segment_id": 999, "type": "NeuroExplorerIO"}
        )
        response = test_client.get(f"/api/spiketraindata/?{params}")
        assert response.status_code == 400
        assert response.json()["error"] == "IndexError on segment_id"
