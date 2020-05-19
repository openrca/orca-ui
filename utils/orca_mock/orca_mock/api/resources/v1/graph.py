# Copyright 2020 OpenRCA Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from flask_restx import Namespace, Resource

namespace = Namespace('graph', description='Graph API')


@namespace.route('/')
class Graph(Resource):

    def get(self):
        return GRAPH_MOCK



GRAPH_MOCK = {
    "nodes": [
        {
            "id": "1111",
            "origin": "kubernetes",
            "kind": "pod",
            "properties": {
                "name": "hello-world-1",
                "namespace": "default"
            }
        },
        {
            "id": "2222",
            "origin": "kubernetes",
            "kind": "pod",
            "properties": {
                "name": "hello-world-2",
                "namespace": "default"
            }
        },
        {
            "id": "3333",
            "origin": "kubernetes",
            "kind": "service",
            "properties": {
                "name": "hello-world",
                "namespace": "default"
            }
        }
    ],
    "links": [
        {
            "id": "1111",
            "source": "3333",
            "target": "1111"
        },
        {
            "id": "2222",
            "source": "3333",
            "target": "2222"
        }
    ]
}
