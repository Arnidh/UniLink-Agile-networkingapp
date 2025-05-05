# Pytest-compatible
def test_addition():
    assert 1 + 2 == 3
# PyUnit
import unittest

class TestMath(unittest.TestCase):
    def test_subtract(self):
        self.assertEqual(5 - 2, 3)

if __name__ == '__main__':
    unittest.main()
