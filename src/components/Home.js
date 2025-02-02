import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BudgetModal from './BudgetModal';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './../api/axiosInstance';

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const navigate = useNavigate();

  // Fetch budgets from the server
  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axiosInstance.get('/api/budgets');
      // Sort budgets by creation date (newest first)
      const sortedBudgets = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBudgets(sortedBudgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Handle modal closing and updating budget list after creation
  const handleModalClose = () => setShowModal(false);

  const handleNewBudget = (newBudget) => {
    setBudgets((prevBudgets) => [newBudget, ...prevBudgets]); // Add new budget at the top
    setShowModal(false);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">🤗 예산 관리 앱에 오신 걸 환영합니다. </h1>
      <Button variant="primary" size="lg" className="mb-3" onClick={() => setShowModal(true)}>
        ➕ 새 예산 생성
      </Button>

      {/* Budget Modal */}
      <BudgetModal show={showModal} onClose={handleModalClose} onNewBudget={handleNewBudget} />

      <Container className="mt-5">
        <h1 className="mb-4">예산 목록</h1>
        <Row xs={1} md={2} lg={3} className="g-4">
          {budgets.length > 0 ? (
            budgets.map((budget) => (
              <Col key={budget._id}>
                <Card className="h-100 shadow-lg" onClick={() => navigate(`/budget/${budget._id}`)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <Row className="d-flex align-items-center justify-content-between mb-2">
                      <Col>
                        <Card.Title className="fw-bold">{budget.name}</Card.Title>
                      </Col>
                      <Col className="text-end">
                        <p className="mb-0">📅 생성일자: {new Date(budget.createdAt).toLocaleDateString()}</p>
                      </Col>
                    </Row>
                    <Card.Subtitle className="mb-2 text-muted">
                      💰 예산 금액: ${budget.totalAmount.toLocaleString()}
                    </Card.Subtitle>
                    <Card.Text>{budget.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-muted">❌ No budgets found. Create a new budget to get started.</p>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Home;


